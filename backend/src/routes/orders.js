// src/routes/orders.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /orders - Listar todos os pedidos do usuário (Com Paginação)
router.get('/', async (req, res) => {
    const { page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // SEGURANÇA: Omitimos 'lucro_liquido' para não vazar margens da loja para o cliente
        const orders = await knex('orders')
            .select('id', 'total', 'status', 'tracking_code', 'tracking_carrier', 'created_at', 'updated_at')
            .where({ user_id: req.user.id })
            .orderBy('created_at', 'desc')
            .limit(parseInt(limit))
            .offset(offset);

        const totalCount = await knex('orders').where({ user_id: req.user.id }).count('id as count').first();

        res.json({
            orders,
            pagination: {
                total: parseInt(totalCount.count),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('List orders error:', err);
        res.status(500).json({ error: 'Erro ao listar pedidos.' });
    }
});

/**
 * POST /orders/system/cleanup
 * PERFORMANCE: Libera estoque de pedidos pendentes com mais de 24h.
 * Isso evita "estoque fantasma" onde produtos ficam reservados sem pagamento.
 */
router.post('/system/cleanup', async (req, res) => {
    try {
        const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas atrás

        const expiredOrders = await knex('orders')
            .where('status', 'pending')
            .andWhere('created_at', '<', threshold);

        if (expiredOrders.length === 0) {
            return res.json({ message: 'Nenhum pedido pendente para limpar.' });
        }

        let totalRestored = 0;

        for (const order of expiredOrders) {
            await knex.transaction(async (trx) => {
                const items = await trx('order_items').where({ order_id: order.id });

                for (const item of items) {
                    await trx('products')
                        .where({ id: item.product_id })
                        .increment('estoque', item.quantidade);
                    totalRestored++;
                }

                await trx('orders').where({ id: order.id }).update({
                    status: 'canceled',
                    updated_at: new Date()
                });
            });
        }

        res.json({
            message: `Limpeza concluída. ${expiredOrders.length} pedidos cancelados, ${totalRestored} itens devolvidos ao estoque.`,
            expired_count: expiredOrders.length
        });

    } catch (err) {
        console.error('System cleanup error:', err);
        res.status(500).json({ error: 'Erro ao processar limpeza de estoque.' });
    }
});

// GET /orders/:id - Detalhes de um pedido específico
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // SEGURANÇA: Omitimos 'lucro_liquido' para não vazar margens da loja para o cliente
        const order = await knex('orders')
            .select('id', 'total', 'status', 'tracking_code', 'tracking_carrier', 'created_at', 'updated_at')
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
