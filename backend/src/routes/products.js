// src/routes/products.js
const express = require('express');
const router = express.Router();
const knex = require('../db');

// GET /products - list with optional filters/AI Curation
router.get('/', async (req, res) => {
    const { categoria, minPrice, maxPrice, q, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const offset = (pageNum - 1) * limitNum;
    try {
        let query = knex('products');

        if (categoria) query = query.where('categoria', categoria);
        if (minPrice) query = query.andWhere('preco', '>=', parseFloat(minPrice));
        if (maxPrice) query = query.andWhere('preco', '<=', parseFloat(maxPrice));

        if (q) {
            const searchTerms = q.split(' ').filter(term => term.trim().length > 0);
            query = query.where(function () {
                searchTerms.forEach(term => {
                    this.orWhere('titulo', 'ilike', `%${term}%`)
                        .orWhere('descricao', 'ilike', `%${term}%`);
                });
            });
        }

        const products = await query.select()
            .orderBy('id', 'desc')
            .limit(limitNum)
            .offset(offset);
        res.json(products);
    } catch (err) {
        console.error('Products list error:', err);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});

// GET /products/:id - product detail
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID de produto inválido.' });
    }

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
