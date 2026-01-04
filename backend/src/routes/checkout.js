// src/routes/checkout.js
const express = require('express');
const router = express.Router();
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = require('knex')(config);
const jwt = require('jsonwebtoken');

// Middleware to verify JWT (simple version)
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token ausente' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user; // contains id, email
        next();
    });
}

router.use(verifyToken);

// POST /checkout - cria pedido e inicia pagamento (placeholder)
router.post('/', async (req, res) => {
    const { address, payment_method } = req.body; // payment_method e.g. 'pagseguro'
    if (!address || !payment_method) {
        return res.status(400).json({ error: 'Endereço e método de pagamento são obrigatórios.' });
    }
    try {
        // Busca carrinho do usuário (assume cart tables exist)
        const cart = await knex('carts').where({ user_id: req.user.id }).first();
        if (!cart) return res.status(400).json({ error: 'Carrinho vazio.' });
        const items = await knex('cart_items').where({ cart_id: cart.id });
        if (items.length === 0) return res.status(400).json({ error: 'Carrinho vazio.' });

        // Calcula total
        const productIds = items.map(i => i.product_id);
        const products = await knex('products').whereIn('id', productIds);
        const total = items.reduce((sum, item) => {
            const prod = products.find(p => p.id === item.product_id);
            return sum + (prod ? Number(prod.preco) * item.quantidade : 0);
        }, 0);

        // Cria ordem
        const [orderId] = await knex('orders')
            .insert({
                user_id: req.user.id,
                total,
                status: 'pending',
            })
            .returning('id');

        // Insere itens da ordem
        const orderItems = items.map(i => ({
            order_id: orderId,
            product_id: i.product_id,
            quantidade: i.quantidade,
            preco_unitario: products.find(p => p.id === i.product_id).preco,
        }));
        await knex('order_items').insert(orderItems);

        // TODO: integrar PagSeguro aqui – por enquanto retornamos um placeholder URL
        const paymentUrl = `https://sandbox.pagseguro.uol.com.br/v2/checkout?order_id=${orderId}`;

        // Cria registro de pagamento
        await knex('payments').insert({
            order_id: orderId,
            metodo: payment_method,
            status: 'pending',
            valor: total,
            provider_id: null,
        });

        // Limpa carrinho
        await knex('cart_items').where({ cart_id: cart.id }).del();
        await knex('carts').where({ id: cart.id }).del();

        res.status(201).json({ order_id: orderId, payment_url: paymentUrl });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: 'Erro ao processar checkout.' });
    }
});

module.exports = router;
