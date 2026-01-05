// src/routes/cart.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { verifyToken } = require('../middleware/auth');

// Aplica autenticação em todas as rotas de carrinho
router.use(verifyToken);

// GET /cart - listar itens (Performance: Single Join Query)
router.get('/', async (req, res) => {
    try {
        // PERFORMANCE: Busca tudo em uma única query JOIN
        const items = await knex('cart_items')
            .join('carts', 'cart_items.cart_id', 'carts.id')
            .join('products', 'cart_items.product_id', 'products.id')
            .where('carts.user_id', req.user.id)
            .select(
                'cart_items.id',
                'products.id as product_id',
                'products.titulo',
                'products.preco',
                'products.imagens',
                'cart_items.quantidade'
            );

        res.json({ items: items || [] });
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
        const product = await knex('products').select('id', 'estoque', 'titulo').where({ id: product_id }).first();
        if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

        // Usa transação para garantir integridade
        await knex.transaction(async (trx) => {
            let cart = await trx('carts').where({ user_id: req.user.id }).forUpdate().first();

            if (!cart) {
                const results = await trx('carts').insert({ user_id: req.user.id }).returning('*');
                cart = results[0];
            }

            const existing = await trx('cart_items')
                .where({ cart_id: cart.id, product_id })
                .forUpdate()
                .first();

            if (existing) {
                // Validação de Estoque (Lógica Crítica UX)
                const product = await trx('products').select('estoque').where({ id: product_id }).first();
                if (!product) throw new Error('Produto não encontrado.');

                const novaQuantidade = existing.quantidade + parseInt(quantidade);
                if (product.estoque < novaQuantidade) {
                    throw new Error(`Estoque insuficiente. Disponível: ${product.estoque}`);
                }

                await trx('cart_items')
                    .where({ id: existing.id })
                    .update({ quantidade: novaQuantidade });
            } else {
                // Validação de Estoque para novos itens
                const product = await trx('products').select('estoque').where({ id: product_id }).first();
                if (!product) throw new Error('Produto não encontrado.');

                if (product.estoque < parseInt(quantidade)) {
                    throw new Error(`Estoque insuficiente. Disponível: ${product.estoque}`);
                }

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
        if (err.message.includes('Estoque insuficiente')) {
            return res.status(400).json({ error: err.message });
        }
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

// PUT /cart/:itemId - Atualizar quantidade (Lógica de Definir Valor Exato)
router.put('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || quantidade < 1) {
        return res.status(400).json({ error: 'Quantidade deve ser pelo menos 1.' });
    }

    try {
        await knex.transaction(async (trx) => {
            const cart = await trx('carts').where({ user_id: req.user.id }).first();
            if (!cart) throw new Error('CARRINHO_NAO_ENCONTRADO');

            const item = await trx('cart_items')
                .where({ id: itemId, cart_id: cart.id })
                .first();

            if (!item) throw new Error('ITEM_NAO_ENCONTRADO');

            // Validação de Estoque
            const product = await trx('products')
                .select('estoque', 'titulo')
                .where({ id: item.product_id })
                .first();

            if (product.estoque < parseInt(quantidade)) {
                throw new Error(`Estoque insuficiente de ${product.titulo}. Disponível: ${product.estoque}`);
            }

            await trx('cart_items')
                .where({ id: itemId })
                .update({ quantidade: parseInt(quantidade) });
        });

        res.json({ message: 'Quantidade atualizada.' });
    } catch (err) {
        console.error('Cart update error:', err);
        const code = err.message.includes('Estoque') ? 400 : 500;
        res.status(code).json({ error: err.message });
    }
});

module.exports = router;
