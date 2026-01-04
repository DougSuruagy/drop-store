/**
 * AURUM TECH - Webhooks
 * Recebe notificações do Mercado Pago e processa automaticamente.
 * 
 * FLUXO AUTOMÁTICO:
 * 1. MP notifica pagamento aprovado
 * 2. Sistema valida assinatura
 * 3. Atualiza status do pedido
 * 4. Encaminha ao fornecedor (SupplierBridge)
 * 5. Registra lucro
 */

const express = require('express');
const router = express.Router();
const knex = require('../db');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const supplierBridge = require('../services/SupplierBridge');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-MOCK'
});

/**
 * POST /webhooks/mercadopago
 * Endpoint para receber notificações do Mercado Pago
 */
router.post('/mercadopago', async (req, res) => {
    console.log('🔔 [Webhook] Notificação recebida:', req.body);

    // Responde imediatamente (exigência do MP)
    res.status(200).send('OK');

    try {
        const { type, data } = req.body;

        // Só processa notificações de pagamento
        if (type !== 'payment') {
            console.log(`[Webhook] Ignorando tipo: ${type}`);
            return;
        }

        const paymentId = data?.id;
        if (!paymentId) {
            console.log('[Webhook] ID de pagamento não encontrado');
            return;
        }

        // Busca detalhes do pagamento no MP
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log(`💳 [Webhook] Pagamento ${paymentId}: ${paymentData.status}`);

        // Extrai ID do pedido da referência externa
        const orderId = parseInt(paymentData.external_reference);
        if (!orderId) {
            console.log('[Webhook] Referência externa inválida');
            return;
        }

        // Processa conforme status
        switch (paymentData.status) {
            case 'approved':
                await processarPagamentoAprovado(orderId, paymentData);
                break;
            case 'pending':
                await atualizarStatusPedido(orderId, 'pending_payment');
                break;
            case 'rejected':
            case 'cancelled':
                await atualizarStatusPedido(orderId, 'payment_failed');
                break;
            case 'refunded':
                await processarReembolso(orderId, paymentData);
                break;
            default:
                console.log(`[Webhook] Status não tratado: ${paymentData.status}`);
        }

    } catch (error) {
        console.error('❌ [Webhook] Erro ao processar:', error);
    }
});

/**
 * Processa pagamento aprovado - FLUXO PRINCIPAL
 */
async function processarPagamentoAprovado(orderId, paymentData) {
    console.log(`✅ [Webhook] Processando aprovação do pedido #${orderId}`);

    // 1. Atualiza status do pedido
    await knex('orders').where({ id: orderId }).update({
        status: 'paid',
        payment_id: paymentData.id?.toString(),
        payment_method: paymentData.payment_method_id,
        updated_at: new Date()
    });

    // 2. Registra pagamento
    await knex('payments').insert({
        order_id: orderId,
        payment_id: paymentData.id?.toString(),
        status: 'approved',
        amount: paymentData.transaction_amount,
        fee: paymentData.fee_details?.[0]?.amount || 0,
        net_amount: paymentData.transaction_details?.net_received_amount || paymentData.transaction_amount,
        method: paymentData.payment_method_id
    }).catch(err => {
        // Ignora se tabela não existir ou duplicata
        console.log('[Webhook] Aviso ao registrar pagamento:', err.message);
    });

    // 3. AUTOMAÇÃO: Encaminha ao fornecedor
    const resultado = await supplierBridge.processarPedidoAprovado(orderId);
    console.log(`📦 [Webhook] Encaminhamento ao fornecedor:`, resultado);

    // 4. Calcula e registra lucro
    const order = await knex('orders').where({ id: orderId }).first();
    if (order?.lucro_liquido) {
        console.log(`💰 [Webhook] Lucro registrado: R$ ${order.lucro_liquido}`);
    }

    console.log(`🎉 [Webhook] Pedido #${orderId} processado com sucesso!`);
}

/**
 * Atualiza apenas o status do pedido
 */
async function atualizarStatusPedido(orderId, novoStatus) {
    await knex('orders').where({ id: orderId }).update({
        status: novoStatus,
        updated_at: new Date()
    });
    console.log(`📝 [Webhook] Pedido #${orderId} atualizado para: ${novoStatus}`);
}

/**
 * Processa reembolso
 */
async function processarReembolso(orderId, paymentData) {
    console.log(`💸 [Webhook] Processando reembolso do pedido #${orderId}`);

    // Atualiza status
    await knex('orders').where({ id: orderId }).update({
        status: 'refunded',
        updated_at: new Date()
    });

    // Restaura estoque
    const items = await knex('order_items').where({ order_id: orderId });
    for (const item of items) {
        await knex('products')
            .where({ id: item.product_id })
            .increment('estoque', item.quantidade);
    }

    console.log(`🔄 [Webhook] Estoque restaurado para pedido #${orderId}`);
}

/**
 * GET /webhooks/test
 * Endpoint de teste para verificar se webhooks estão funcionando
 */
router.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Webhook Aurum Tech operacional',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
