// src/routes/products.js
const express = require('express');
const router = express.Router();
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = require('knex')(config);

// GET /products - list with optional filters (category, price range, search)
router.get('/', async (req, res) => {
    const { categoria, minPrice, maxPrice, q } = req.query;
    try {
        let query = knex('products');
        if (categoria) query = query.where('categoria', categoria);
        if (minPrice) query = query.andWhere('preco', '>=', minPrice);
        if (maxPrice) query = query.andWhere('preco', '<=', maxPrice);
        if (q) query = query.andWhere('titulo', 'ilike', `%${q}%`);
        const products = await query.select();
        res.json(products);
    } catch (err) {
        console.error('Products list error:', err);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});

// GET /products/:id - product detail
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await knex('products').where({ id }).first();
        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
        res.json(product);
    } catch (err) {
        console.error('Product detail error:', err);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});

module.exports = router;
