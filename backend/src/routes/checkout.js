// src/routes/checkout.js
const express = require('express');
const router = express.Router();
const knex = require('../db');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// AURUM TECH - Configuração Mercado Pago (100% sem custo fixo)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-8273...-MOCK'
});

/**
 * POST /checkout
 * SUPORTA GUEST CHECKOUT (Regra 4 - Sem Cadastro Obrigatório)
 */
router.post('/', async (req, res) => {
    // 1. Identifica usuário (Token ou Guest)
    let userId = null;
    let userEmail = null;

    const authHeader = req.headers['authorization'];
    if (authHeader) {
        try {
            const jwt = require('jsonwebtoken');
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-muito-seguro-para-desenvolvimento');
            userId = decoded.id;
            userEmail = decoded.email;
        } catch (e) { /* Token inválido */ }
    }

    const { address, guest_info, cart_items } = req.body;

    // Se não logado, exige guest_info (Auto-registro invisível)
    if (!userId) {
        if (!guest_info || !guest_info.email || !guest_info.nome) {
            return res.status(400).json({ error: 'Identificação ou informações de convidado são obrigatórias.' });
        }

        try {
            let user = await knex('users').where({ email: guest_info.email }).first();
            if (!user) {
                const [newUser] = await knex('users').insert({
                    nome: guest_info.nome,
                    email: guest_info.email,
                    senha_hash: 'GUEST_ACCOUNT',
                    endereco: address
                }).returning('*');
                user = newUser;
            }
            userId = user.id;
            userEmail = user.email;
        } catch (err) {
            console.error('Guest setup error:', err);
            return res.status(500).json({ error: 'Erro ao processar dados do cliente.' });
        }
    }

    if (!address) return res.status(400).json({ error: 'Endereço de entrega é obrigatório.' });

    try {
        // PERFOMANCE CRÍTICA: Processamento de DB em transação, 
        // mas chamadas externas (Mercado Pago) FORA para não segurar locks no banco.
        const orderData = await knex.transaction(async (trx) => {
            let items = [];
            if (cart_items && cart_items.length > 0) {
                items = cart_items;
            } else {
                const cart = await trx('carts').where({ user_id: userId }).first();
                if (!cart) throw new Error('CARRINHO_VAZIO');
                items = await trx('cart_items').where({ cart_id: cart.id });
            }

            if (items.length === 0) throw new Error('CARRINHO_VAZIO');

            // PERFORMANCE & CONCURRENCY: Bloqueia as linhas dos produtos para garantir que o estoque não mude durante o cálculo
            const products = await trx('products')
                .whereIn('id', items.map(i => i.product_id))
                .forUpdate();

            let total = 0;
            let totalCost = 0;
            const processedItems = [];

            for (const item of items) {
                const prod = products.find(p => p.id === item.product_id);
                if (!prod) throw new Error(`PRODUTO_NAO_ENCONTRADO_${item.product_id}`);

                // VALIDAÇÃO DE ESTOQUE (Bug Lógico Crítico)
                if (prod.estoque < item.quantidade) {
                    throw new Error(`ESTOQUE_INSUFICIENTE_${prod.titulo}`);
                }

                const subtotal = Number(prod.preco) * item.quantidade;
                const subtotalCost = Number(prod.preco_custo || 0) * item.quantidade;

                // ANTI-LOSS: Usa LeanAI para validação consistente de margem (40%)
                const leanAI = require('../services/LeanAI');
                const validacao = leanAI.validarVenda(Number(prod.preco), Number(prod.preco_custo || 0));
                if (!validacao.allowed) {
                    throw new Error(`MARGEM_INSUFICIENTE_${prod.titulo}`);
                }

                // ATUALIZA ESTOQUE NO BANCO (Dentro da Transação)
                await trx('products')
                    .where({ id: prod.id })
                    .decrement('estoque', item.quantidade);

                total += subtotal;
                totalCost += subtotalCost;

                // PERFORMANCE: Criamos um objeto limpo para evitar conflitos de IDs de tabelas diferentes (Carts vs Orders)
                processedItems.push({
                    product_id: prod.id,
                    quantidade: item.quantidade,
                    titulo: prod.titulo,
                    preco: prod.preco
                });
            }

            const mpFee = total * 0.05;
            const [order] = await trx('orders')
                .insert({
                    user_id: userId,
                    total: total.toFixed(2),
                    lucro_liquido: (total - totalCost - mpFee).toFixed(2),
                    status: 'pending',
                })
                .returning('*');

            await trx('order_items').insert(processedItems.map(i => ({
                order_id: order.id,
                product_id: i.product_id,
                quantidade: i.quantidade,
                preco_unitario: i.preco
            })));

            const cartToDelete = await trx('carts').where({ user_id: userId }).first();
            if (cartToDelete) {
                await trx('cart_items').where({ cart_id: cartToDelete.id }).del();
                await trx('carts').where({ id: cartToDelete.id }).del();
            }

            return { order, processedItems };
        });

        // CHAMADA EXTERNA (Mercado Pago) - Fora da transação SQL (Performance e Estabilidade)
        const preference = new Preference(client);
        const mpItems = orderData.processedItems.map(i => ({
            title: i.titulo,
            unit_price: Number(i.preco),
            quantity: i.quantidade,
            currency_id: 'BRL'
        }));

        const mpResponse = await preference.create({
            body: {
                items: mpItems,
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/checkout/success?order_id=${orderData.order.id}`,
                    failure: `${process.env.FRONTEND_URL}/checkout/error`,
                    pending: `${process.env.FRONTEND_URL}/checkout/pending`,
                },
                auto_return: 'approved',
                external_reference: orderData.order.id.toString(),
                binary_mode: true // Prioriza Pix e aprovação imediata
            }
        });

        res.status(201).json({
            order_id: orderData.order.id,
            total: orderData.order.total,
            payment_url: mpResponse.init_point
        });

    } catch (err) {
        console.error('Checkout error:', err);
        if (err.message === 'CARRINHO_VAZIO') return res.status(400).json({ error: 'Seu carrinho está vazio.' });
        if (err.message.startsWith('MARGEM_INSUFICIENTE')) return res.status(400).json({ error: 'IA detectou margem insuficiente para esta operação.' });
        if (err.message.startsWith('ESTOQUE_INSUFICIENTE')) return res.status(400).json({ error: 'Um ou mais itens esgotaram enquanto você comprava. Verifique o estoque.' });

        res.status(500).json({ error: 'Erro ao processar checkout.' });
    }
});

module.exports = router;
