// backend/jobs/paymentProcessor.js
const { Queue, Worker } = require('bullmq');
const { Preference } = require('mercadopago');
const knex = require('../src/db');

// Configura a fila usando a URL do Redis (Render injeta REDIS_URL)
// Tenta usar ioredis format se REDIS_URL for string completa
// Configura a fila usando a URL do Redis (Render injeta REDIS_URL)
const IORedis = require('ioredis');

let connection;
if (process.env.REDIS_URL) {
    // Render External/Internal Redis URL (rediss://...)
    connection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        // Garante suporte a TLS se a URL for rediss://
        tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });
} else {
    // Fallback local
    connection = new IORedis({
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: null
    });
}

const paymentQueue = new Queue('payment', { connection });

// Cliente Mercado Pago (token via env)
const mpClient = new (require('mercadopago')).MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN'
});

/**
 * Enfileira um job que criará a preferência de pagamento no Mercado Pago.
 * @param {{orderId:number, items:Array, orderTotal:number, mpZeroCost:boolean}} payload
 */
async function enqueuePaymentJob(payload) {
    await paymentQueue.add('process', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });
}

// Worker que realmente cria a preferência e atualiza o pedido
const worker = new Worker(
    'payment',
    async job => {
        const { orderId, items, orderTotal, mpZeroCost } = job.data;

        const mpItems = items.map(i => ({
            title: i.titulo,
            unit_price: Number(i.preco),
            quantity: i.quantidade,
            currency_id: 'BRL'
        }));

        const preference = new Preference(mpClient);
        const mpResponse = await preference.create({
            body: {
                items: mpItems,
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/checkout/success?order_id=${orderId}`,
                    failure: `${process.env.FRONTEND_URL}/checkout/error`,
                    pending: `${process.env.FRONTEND_URL}/checkout/pending`
                },
                auto_return: 'approved',
                external_reference: orderId.toString(),
                date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                binary_mode: true,
                statement_descriptor: 'DROPSTORE',
                payment_methods: {
                    excluded_payment_types: [{ id: 'ticket' }],
                    installments: 12
                }
            }
        });

        // Atualiza o pedido com a URL de pagamento e status
        await knex('orders')
            .where({ id: orderId })
            .update({
                payment_url: mpResponse.init_point,
                status: 'awaiting_payment',
                updated_at: new Date()
            });
    },
    { connection, concurrency: 5 }
);

// Caso o job falhe, devolve estoque e marca pedido como falha
worker.on('failed', async (job, err) => {
    console.error(`❌ Job ${job.id} falhou:`, err);
    const { orderId, items } = job.data;
    await knex.transaction(async trx => {
        for (const item of items) {
            await trx('products')
                .where({ id: item.product_id })
                .increment('estoque', item.quantidade);
        }
        await trx('orders')
            .where({ id: orderId })
            .update({ status: 'failed_checkout', updated_at: new Date() });
    });
});

module.exports = { enqueuePaymentJob };
