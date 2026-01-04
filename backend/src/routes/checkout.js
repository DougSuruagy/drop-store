const express = require('express');
const router = express.Router();
const knex = require('../db');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const LeanAI = require('../services/LeanAI');

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

    const { address, guest_info, cart_items, total_visualizado } = req.body;

    // Se não logado, exige guest_info (Auto-registro invisível)
    if (!userId) {
        if (!guest_info || !guest_info.email || !guest_info.nome) {
            return res.status(400).json({ error: 'Identificação ou informações de convidado são obrigatórias.' });
        }

        try {
            // SEGURANÇA: Verifica se o e-mail já pertence a um usuário registrado
            // Se existir, impedimos o checkout de "convidado" para evitar sequestro de conta.
            let user = await knex('users').where({ email: guest_info.email }).first();

            if (user && user.senha_hash !== 'GUEST_ACCOUNT') {
                return res.status(401).json({
                    error: 'Este e-mail já possui uma conta. Por favor, faça login para continuar.',
                    require_login: true
                });
            }

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
        // PERFOMANCE CRÍTICA: Processamento de DB em transação
        const orderData = await knex.transaction(async (trx) => {
            let items = [];
            let fromCart = false; // Flag para controlar limpeza do carrinho

            if (cart_items && cart_items.length > 0) {
                // Sanitização básica se vier do body (Compra Direta)
                items = cart_items;
                fromCart = false;
            } else {
                // Compra do Carrinho Salvo
                const cart = await trx('carts').where({ user_id: userId }).first();
                if (!cart) throw new Error('CARRINHO_VAZIO');
                items = await trx('cart_items').where({ cart_id: cart.id });
                fromCart = true;
            }

            if (items.length === 0) throw new Error('CARRINHO_VAZIO');

            // CORREÇÃO LOGICA CRÍTICA: Agrupar itens iguais para validar estoque total necessário
            const consolidatedItems = items.reduce((acc, item) => {
                const existing = acc.find(i => i.product_id === item.product_id);
                if (existing) {
                    existing.quantidade = Number(existing.quantidade) + Number(item.quantidade);
                } else {
                    acc.push({ ...item, quantidade: Number(item.quantidade) });
                }
                return acc;
            }, []);

            // PERFORMANCE & CONCURRENCY: Bloqueia apenas os IDs necessários
            const products = await trx('products')
                .whereIn('id', consolidatedItems.map(i => i.product_id))
                .forUpdate();

            let total = 0;
            let totalCost = 0;
            const processedItems = [];

            for (const item of consolidatedItems) {
                const prod = products.find(p => p.id === item.product_id);
                if (!prod) throw new Error(`PRODUTO_NAO_ENCONTRADO_${item.product_id}`);

                // VALIDAÇÃO DE ESTOQUE ROBUSTA (Agora considerando a soma total)
                if (prod.estoque < item.quantidade) {
                    throw new Error(`ESTOQUE_INSUFICIENTE_${prod.titulo}`);
                }

                const subtotal = Number(prod.preco) * item.quantidade;
                const subtotalCost = Number(prod.preco_custo || 0) * item.quantidade;

                // ANTI-LOSS: Validação de margem com LeanAI
                const validacao = LeanAI.validarVenda(Number(prod.preco), Number(prod.preco_custo || 0));
                if (!validacao.allowed) {
                    throw new Error(`MARGEM_INSUFICIENTE_${prod.titulo}`);
                }

                // ATUALIZA ESTOQUE NO BANCO
                await trx('products')
                    .where({ id: prod.id })
                    .decrement('estoque', item.quantidade);

                total += subtotal;
                totalCost += subtotalCost;

                processedItems.push({
                    product_id: prod.id,
                    quantidade: item.quantidade,
                    titulo: prod.titulo,
                    preco: prod.preco
                });
            }

            // SEGURANÇA LÓGICA: Validação do Preço Final
            // Se o preço no banco mudou enquanto o usuário estava na página (ou houve tentativa de fraude), bloqueamos.
            if (total_visualizado && Math.abs(Number(total_visualizado) - total) > 0.05) {
                throw new Error('PRECO_ALTERADO');
            }

            const mpFee = total * 0.05; // Taxa estimada MP
            const [order] = await trx('orders')
                .insert({
                    user_id: userId,
                    total: total.toFixed(2),
                    lucro_liquido: (total - totalCost - mpFee).toFixed(2),
                    status: 'pending',
                    endereco_entrega: address,
                    nome_cliente: guest_info?.nome || '', // Pega do guest ou seria bom ter do user
                    email_cliente: userEmail
                })
                .returning('*');

            // ATUALIZAÇÃO DE ENDEREÇO DO USUÁRIO (Praticidade UX)
            // Se for um usuário logado e o endereço for diferente, atualizamos o perfil
            if (userId && address) {
                await trx('users')
                    .where({ id: userId })
                    .update({ endereco: address });
            }

            await trx('order_items').insert(processedItems.map(i => ({
                order_id: order.id,
                product_id: i.product_id,
                quantidade: i.quantidade,
                preco_unitario: i.preco,
                titulo_snapshot: i.titulo, // SEGURANÇA LÓGICA: Snapshot para não mudar com o catálogo
                preco_snapshot: i.preco
            })));

            // CORREÇÃO: Só deleta o carrinho se a origem da compra foi o carrinho
            if (fromCart) {
                const cartToDelete = await trx('carts').where({ user_id: userId }).first();
                if (cartToDelete) {
                    await trx('cart_items').where({ cart_id: cartToDelete.id }).del();
                    await trx('carts').where({ id: cartToDelete.id }).del();
                }
            }

            return { order, processedItems };
        });

        // CHAMADA EXTERNA (Mercado Pago)
        // LÓGICA DE COMPENSAÇÃO (Critical Reliability):
        // Se a API do MP falhar, precisamos devolver o estoque e marcar como falha.
        let mpResponse;
        try {
            const preference = new Preference(client);
            const mpItems = orderData.processedItems.map(i => ({
                title: i.titulo,
                unit_price: Number(i.preco),
                quantity: i.quantidade,
                currency_id: 'BRL'
            }));

            mpResponse = await preference.create({
                body: {
                    items: mpItems,
                    back_urls: {
                        success: `${process.env.FRONTEND_URL}/checkout/success?order_id=${orderData.order.id}`,
                        failure: `${process.env.FRONTEND_URL}/checkout/error`,
                        pending: `${process.env.FRONTEND_URL}/checkout/pending`,
                    },
                    auto_return: 'approved',
                    external_reference: orderData.order.id.toString(),
                    date_of_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    binary_mode: true,
                    statement_descriptor: "DROPSTORE",
                    payment_methods: {
                        excluded_payment_types: [{ id: "ticket" }],
                        installments: 12
                    }
                }
            });
        } catch (mpError) {
            console.error(`❌ [Checkout] Falha na API Mercado Pago para Pedido #${orderData.order.id}:`, mpError);

            // Reverte o estoque imediatamente para não travar o produto
            await knex.transaction(async (trx) => {
                for (const item of orderData.processedItems) {
                    await trx('products')
                        .where({ id: item.product_id })
                        .increment('estoque', item.quantidade);
                }
                await trx('orders')
                    .where({ id: orderData.order.id })
                    .update({ status: 'failed_checkout', updated_at: new Date() });
            });

            throw new Error('MERCADO_PAGO_UNAVAILABLE');
        }

        res.status(201).json({
            order_id: orderData.order.id,
            total: orderData.order.total,
            payment_url: mpResponse.init_point
        });

    } catch (err) {
        console.error('Checkout error:', err);
        if (err.message === 'CARRINHO_VAZIO') return res.status(400).json({ error: 'Seu carrinho está vazio.' });
        if (err.message === 'PRECO_ALTERADO') return res.status(400).json({ error: 'O preço de alguns itens foi alterado. Por favor, atualize a página e tente novamente.' });
        if (err.message === 'MERCADO_PAGO_UNAVAILABLE') return res.status(503).json({ error: 'Gateway de pagamento temporariamente indisponível. Seu estoque foi liberado. Tente novamente em instantes.' });
        if (err.message.startsWith('MARGEM_INSUFICIENTE')) return res.status(400).json({ error: 'IA detectou margem insuficiente para esta operação.' });
        if (err.message.startsWith('ESTOQUE_INSUFICIENTE')) return res.status(400).json({ error: 'Um ou mais itens esgotaram enquanto você comprava. Verifique o estoque.' });

        res.status(500).json({ error: err.require_login ? err.error : 'Erro ao processar checkout.' });
    }
});

module.exports = router;
