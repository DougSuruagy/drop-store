// src/routes/products.js
const express = require('express');
const router = express.Router();
const knex = require('../db');

// PERFORMANCE: Cache em memória para os produtos mais vistos
const productCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minuto

// GET /products - list with optional filters/AI Curation
router.get('/', async (req, res) => {
    const { categoria, minPrice, maxPrice, q, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const offset = (pageNum - 1) * limitNum;

    try {
        let query = knex('products').where({ visivel: true });
        let countQuery = knex('products').where({ visivel: true });

        if (categoria) {
            query = query.where('categoria', categoria);
            countQuery = countQuery.where('categoria', categoria);
        }
        if (minPrice) {
            query = query.andWhere('preco', '>=', parseFloat(minPrice));
            countQuery = countQuery.andWhere('preco', '>=', parseFloat(minPrice));
        }
        if (maxPrice) {
            query = query.andWhere('preco', '<=', parseFloat(maxPrice));
            countQuery = countQuery.andWhere('preco', '<=', parseFloat(maxPrice));
        }

        if (q) {
            const searchFunc = function () {
                this.whereRaw(
                    "to_tsvector('portuguese', titulo || ' ' || descricao) @@ plainto_tsquery('portuguese', ?)",
                    [q]
                );
            };
            query = query.where(searchFunc);
            countQuery = countQuery.where(searchFunc);
        }

        const products = await query.select(
            'id', 'titulo', 'preco', 'imagens', 'categoria', 'estoque'
        )
            .orderBy('id', 'desc')
            .limit(limitNum)
            .offset(offset);

        const totalResult = await countQuery.count('id as total').first();
        const total = parseInt(totalResult.total, 10);

        // PERFORMANCE: Cache no cliente/CDN por 60 segundos
        res.set('Cache-Control', 'public, max-age=60');
        res.json({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
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

    const cached = productCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return res.json(cached.data);
    }

    try {
        const product = await knex('products')
            .select(
                'id',
                'titulo',
                'preco',
                'imagens',
                'categoria',
                'estoque',
                'descricao',
                'beneficios',
                'prova_social'
            )
            .where({ id })
            .first();

        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

        const related = await knex('products')
            .where({ categoria: product.categoria, visivel: true })
            .whereNot({ id: product.id })
            .select('id', 'titulo', 'preco', 'imagens')
            .limit(4);

        const responseData = { ...product, related };

        productCache.set(id, {
            data: responseData,
            timestamp: Date.now()
        });

        res.json(responseData);
    } catch (err) {
        console.error('Product detail error:', err);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});

module.exports = {
    router,
    productCache
};
