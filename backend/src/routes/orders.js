// src/routes/orders.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /orders - Listar todos os pedidos do usuário
router.get('/', async (req, res) => {
    try {
        // SEGURANÇA: Omitimos 'lucro_liquido' para não vazar margens da loja para o cliente
        const orders = await knex('orders')
            .select('id', 'total', 'status', 'tracking_code', 'tracking_carrier', 'created_at', 'updated_at')
            .where({ user_id: req.user.id })
            .orderBy('created_at', 'desc');
        res.json(orders);
    } catch (err) {
        console.error('List orders error:', err);
        res.status(500).json({ error: 'Erro ao listar pedidos.' });
    }
});

// GET /orders/:id - Detalhes de um pedido específico
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await knex('orders')
            .where({ id, user_id: req.user.id })
            .first();

        if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

        const items = await knex('order_items')
            .where({ order_id: order.id })
            .join('products', 'order_items.product_id', 'products.id')
            .select(
                'products.id as product_id',
                'products.titulo',
                'products.imagens',
                'order_items.quantidade',
                'order_items.preco_unitario'
            );

        res.json({ order, items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
});

// POST /orders/:id/cancel - Cancelar pedido (se pendente)
router.post('/:id/cancel', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await knex('orders')
            .where({ id, user_id: req.user.id })
            .first();

        if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
        if (order.status !== 'pending' && order.status !== 'paid') {
            return res.status(400).json({ error: 'Não é possível cancelar pedidos já enviados ou concluídos.' });
        }

        await knex.transaction(async (trx) => {
            // BUG LÓGICO FIX: Restaurar o estoque dos produtos cancelados
            const items = await trx('order_items').where({ order_id: id });

            for (const item of items) {
                await trx('products')
                    .where({ id: item.product_id })
                    .increment('estoque', item.quantidade);
            }

            await trx('orders').where({ id }).update({ status: 'canceled', updated_at: new Date() });

            // Tenta falhar pagamento se houver registro de pagamento pendente
            await trx('payments').where({ order_id: id }).update({ status: 'cancelled' }).catch(() => { });
        });

        res.json({ message: 'Pedido cancelado com sucesso.' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Erro ao cancelar pedido.' });
    }
});

module.exports = router;
