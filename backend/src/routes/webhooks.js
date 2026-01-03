// src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../../knexfile').development);

// PagSeguro payment webhook (simplified)
router.post('/payment', async (req, res) => {
    // PagSeguro sends a POST with JSON containing order_id and status
    const { order_id, status } = req.body;
    if (!order_id || !status) {
        return res.status(400).json({ error: 'order_id e status são obrigatórios.' });
    }
    try {
        // Atualiza status do pedido
        await knex('orders').where({ id: order_id }).update({ status });
        // Atualiza status do pagamento
        await knex('payments').where({ order_id }).update({ status });
        res.json({ message: 'Webhook processado.' });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'Erro ao processar webhook.' });
    }
});

module.exports = router;
