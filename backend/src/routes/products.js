// src/routes/products.js
const express = require('express');
const router = express.Router();
const knex = require('../db');

// PERFORMANCE: Cache em memória para os produtos mais vistos
// Evita consultas repetitivas ao banco de dados em picos de tráfego.
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
            // PERFORMANCE: Utiliza o GIN Index (Full Text Search) para buscas instantâneas
            // Em vez de ILIKE (que é lento), usamos o motor de busca do PostgreSQL
            const searchFunc = function () {
                this.whereRaw(
                    "to_tsvector('portuguese', titulo || ' ' || descricao) @@ plainto_tsquery('portuguese', ?)",
                    [q]
                );
            };
            query = query.where(searchFunc);
            countQuery = countQuery.where(searchFunc);
        }

        // PERFORMANCE & SECURITY: Selecionar apenas campos públicos necessários
        const products = await query.select(
            'id', 'titulo', 'preco', 'imagens', 'categoria', 'estoque'
        )
            .orderBy('id', 'desc')
            .limit(limitNum)
            .offset(offset);

        // UX: Retornar o total para que o frontend saiba quando parar de carregar
        const totalResult = await countQuery.count('id as total').first();
        const total = parseInt(totalResult.total, 10);

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

    // Tenta carregar do cache
    const cached = productCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return res.json(cached.data);
    }

    try {
        // SEGURANÇA: Não selecionamos 'preco_custo' ou 'fornecedor_id' para o cliente
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

        // CROSS-SELL: Busca produtos relacionados (Mesma categoria, exclui o atual)
        const related = await knex('products')
            .where({ categoria: product.categoria })
            .whereNot({ id: product.id })
            .select('id', 'titulo', 'preco', 'imagens')
            .limit(4);

        const responseData = { ...product, related };

        // Salva no cache
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

module.exports = router;
