// src/routes/orders.js
const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../../knexfile').development);
const jwt = require('jsonwebtoken');

// Middleware to verify JWT (reuse from checkout)
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token ausente' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
}

router.use(verifyToken);

// GET /orders/:id - consultar status do pedido (apenas do próprio usuário)
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
            .select('products.id as product_id', 'products.titulo', 'order_items.quantidade', 'order_items.preco_unitario');
        res.json({ order, items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
});

// POST /orders/:id/cancel - cancelar pedido (se ainda pendente)
router.post('/:id/cancel', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await knex('orders')
            .where({ id, user_id: req.user.id })
            .first();
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Só é possível cancelar pedidos pendentes.' });
        }
        await knex('orders').where({ id }).update({ status: 'canceled' });
        // opcional: atualizar pagamento
        await knex('payments').where({ order_id: id }).update({ status: 'failed' });
        res.json({ message: 'Pedido cancelado.' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Erro ao cancelar pedido.' });
    }
});

module.exports = router;
