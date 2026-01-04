// src/routes/cart.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { verifyToken } = require('../middleware/auth');

// Aplica autenticação em todas as rotas de carrinho
router.use(verifyToken);

// GET /cart - listar itens (Performance: Join otimizado)
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

// POST /cart - adicionar ou atualizar item (Correção Lógica: Evitar duplicidade)
router.post('/', async (req, res) => {
    const { product_id, quantidade } = req.body;

    if (!product_id || !quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Dados inválidos. Quantidade deve ser positiva.' });
    }

    try {
        // Usa transação para garantir integridade
        await knex.transaction(async (trx) => {
            let cart = await trx('carts').where({ user_id: req.user.id }).forUpdate().first();

            if (!cart) {
                const results = await trx('carts').insert({ user_id: req.user.id }).returning('*');
                cart = results[0];
            }

            const existing = await trx('cart_items')
                .where({ cart_id: cart.id, product_id })
                .first();

            if (existing) {
                await trx('cart_items')
                    .where({ id: existing.id })
                    .update({ quantidade: existing.quantidade + parseInt(quantidade) });
            } else {
                await trx('cart_items').insert({
                    cart_id: cart.id,
                    product_id,
                    quantidade: parseInt(quantidade)
                });
            }
        });

        res.status(201).json({ message: 'Carrinho atualizado com sucesso.' });
    } catch (err) {
        console.error('Cart add error:', err);
        res.status(500).json({ error: 'Erro ao atualizar carrinho.' });
    }
});

// DELETE /cart/:itemId - remover item (Segurança: Garante que o item pertence ao usuário)
router.delete('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        const cart = await knex('carts').where({ user_id: req.user.id }).first();
        if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado.' });

        const deleted = await knex('cart_items')
            .where({ id: itemId, cart_id: cart.id })
            .del();

        if (!deleted) return res.status(404).json({ error: 'Item não encontrado no seu carrinho.' });

        res.json({ message: 'Item removido.' });
    } catch (err) {
        console.error('Cart delete error:', err);
        res.status(500).json({ error: 'Erro ao remover item.' });
    }
});

module.exports = router;
