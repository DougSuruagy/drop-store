// src/routes/checkout.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// POST /checkout - Cria pedido real com transação ACID
router.post('/', async (req, res) => {
    const { address, payment_method } = req.body;

    if (!address || !payment_method) {
        return res.status(400).json({ error: 'Endereço e método de pagamento são obrigatórios.' });
    }

    try {
        const result = await knex.transaction(async (trx) => {
            // 1. Busca carrinho e itens
            const cart = await trx('carts').where({ user_id: req.user.id }).first();
            if (!cart) throw new Error('CARRINHO_VAZIO');

            const items = await trx('cart_items').where({ cart_id: cart.id });
            if (items.length === 0) throw new Error('CARRINHO_VAZIO');

            // 2. Busca dados atualizados dos produtos para calcular o total (Segurança: Não confiar no preço do frontend)
            const productIds = items.map(i => i.product_id);
            const products = await trx('products').whereIn('id', productIds);

            let total = 0;
            const orderItemsEntries = items.map(item => {
                const prod = products.find(p => p.id === item.product_id);
                if (!prod) throw new Error(`PRODUTO_NAO_ENCONTRADO_${item.product_id}`);

                const subtotal = Number(prod.preco) * item.quantidade;
                total += subtotal;

                return {
                    product_id: item.product_id,
                    quantidade: item.quantidade,
                    preco_unitario: prod.preco
                };
            });

            // 3. Cria a Ordem (Postgres return fix)
            const orderInsert = await trx('orders')
                .insert({
                    user_id: req.user.id,
                    total: total.toFixed(2),
                    status: 'pending',
                })
                .returning('id');

            const orderId = orderInsert[0].id; // Pega o número real do ID

            // 4. Insere itens da ordem
            const orderItems = orderItemsEntries.map(item => ({
                ...item,
                order_id: orderId
            }));
            await trx('order_items').insert(orderItems);

            // 5. Cria registro de pagamento
            await trx('payments').insert({
                order_id: orderId,
                metodo: payment_method,
                status: 'pending',
                valor: total.toFixed(2)
            });

            // 6. Limpa carrinho (Atomicamente)
            await trx('cart_items').where({ cart_id: cart.id }).del();
            await trx('carts').where({ id: cart.id }).del();

            return { orderId, total };
        });

        // Simulação de URL do PagSeguro (Será substituído na integração oficial)
        const paymentUrl = `https://sandbox.pagseguro.uol.com.br/v2/checkout?order_id=${result.orderId}`;

        res.status(201).json({
            order_id: result.orderId,
            total: result.total,
            payment_url: paymentUrl
        });

    } catch (err) {
        console.error('Checkout error:', err);
        if (err.message === 'CARRINHO_VAZIO') {
            return res.status(400).json({ error: 'Seu carrinho está vazio.' });
        }
        res.status(500).json({ error: 'Erro ao processar checkout. Tente novamente.' });
    }
});

module.exports = router;
