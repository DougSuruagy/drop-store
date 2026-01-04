// src/routes/cart.js
const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../../knexfile').development);
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
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

// POST /cart - add item to cart
router.post('/', async (req, res) => {
    const { product_id, quantidade } = req.body;
    if (!product_id || !quantidade) {
        return res.status(400).json({ error: 'product_id e quantidade são obrigatórios.' });
    }
    try {
        // Find or create cart for user
        let cart = await knex('carts').where({ user_id: req.user.id }).first();
        if (!cart) {
            // Create new cart
            const [newCart] = await knex('carts').insert({ user_id: req.user.id }).returning('*');
            cart = newCart;
        }

        // Insert or update cart item
        const existing = await knex('cart_items')
            .where({ cart_id: cart.id, product_id })
            .first();

        if (existing) {
            await knex('cart_items')
                .where({ id: existing.id })
                .update({ quantidade: existing.quantidade + quantidade });
        } else {
            await knex('cart_items').insert({ cart_id: cart.id, product_id, quantidade });
        }
        res.status(201).json({ message: 'Item adicionado ao carrinho.' });
    } catch (err) {
        console.error('Cart add error:', err);
        res.status(500).json({ error: 'Erro ao adicionar ao carrinho.' });
    }
});

// GET /cart - list items in cart
router.get('/', async (req, res) => {
    try {
        const cart = await knex('carts').where({ user_id: req.user.id }).first();
        if (!cart) return res.json({ items: [] });

        const items = await knex('cart_items')
            .where({ cart_id: cart.id })
            .join('products', 'cart_items.product_id', 'products.id')
            .select(
                'cart_items.id',
                'products.id as product_id',
                'products.titulo',
                'products.preco',
                'products.imagens',
                'cart_items.quantidade'
            );
        res.json({ items });
    } catch (err) {
        console.error('Cart list error:', err);
        res.status(500).json({ error: 'Erro ao listar carrinho.' });
    }
});

// DELETE /cart/:itemId - remove item
router.delete('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        const cart = await knex('carts').where({ user_id: req.user.id }).first();
        if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado.' });

        await knex('cart_items')
            .where({ id: itemId, cart_id: cart.id })
            .del();

        res.json({ message: 'Item removido.' });
    } catch (err) {
        console.error('Cart delete error:', err);
        res.status(500).json({ error: 'Erro ao remover item.' });
    }
});

module.exports = router;
