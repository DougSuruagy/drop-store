const express = require('express');
const router = express.Router();
const knex = require('../db');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const LeanAI = require('../services/LeanAI');
// Enfileira jobs de pagamento (BullMQ)
const { enqueuePaymentJob } = require('../../jobs/paymentProcessor');

// AURUM TECH - Configuração Mercado Pago (100% sem custo fixo)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-8273...-MOCK'
});

const rateLimiter = require('../middleware/rateLimiter');

// SEGURANÇA: Evita spam de checkout e tentativas de fraude automatizadas
const checkoutLimiter = rateLimiter(3, 10 * 60 * 1000);

/**
 * POST /checkout
 * SUPORTA GUEST CHECKOUT (Regra 4 - Sem Cadastro Obrigatório)
 */
/**
 * GET /checkout/status/:orderId
 * Polling para verificar status do pagamento (suporta Guest)
 */
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await knex('orders')
            .select('id', 'status', 'payment_url')
            .where({ id: orderId })
            .first();

        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

        res.json({
            id: order.id,
            status: order.status,
            payment_url: order.payment_url
        });
    } catch (err) {
        console.error('Order status poll error:', err);
        res.status(500).json({ error: 'Erro ao buscar status' });
    }
});

router.post('/', checkoutLimiter, async (req, res) => {
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
            // Bloqueia apenas os IDs necessários. 
            // PERFORMANCE: Usa SKIP LOCKED para evitar dead-locks em alta concorrência.
            const products = await trx('products')
                .whereIn('id', consolidatedItems.map(i => i.product_id))
                .forUpdate()
                .skipLocked();

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
                // Decremento de estoque será feito em lote após o loop para melhorar performance

                total += subtotal;
                totalCost += subtotalCost;

                processedItems.push({
                    product_id: prod.id,
                    quantidade: item.quantidade,
                    titulo: prod.titulo,
                    preco: prod.preco,
                    custo: prod.preco_custo,
                    fornecedor_id: prod.fornecedor_id
                });
            }

            // SEGURANÇA LÓGICA: Validação do Preço Final
            // Aceita undefined, null, ou string vazia.
            if (typeof total_visualizado !== 'undefined' && total_visualizado !== null && total_visualizado !== '') {
                const parsed = Number(total_visualizado);
                if (!Number.isNaN(parsed) && Math.abs(parsed - total) > 0.05) {
                    throw new Error('PRECO_ALTERADO');
                }
            }

            const mpFee = (process.env.MP_ZERO_COST === 'true') ? 0 : total * 0.05; // Taxa estimada MP (custo zero opcional)
            const [order] = await trx('orders')
                .insert({
                    user_id: userId,
                    total: total.toFixed(2),
                    lucro_liquido: (total - totalCost - mpFee).toFixed(2),
                    status: 'pending',
                    endereco_entrega: address,
                    nome_cliente: guest_info?.nome || '',
                    email_cliente: userEmail,
                    updated_at: new Date()
                })
                .returning('*');

            // ATUALIZAÇÃO DE ENDEREÇO DO USUÁRIO
            if (userId && address) {
                await trx('users')
                    .where({ id: userId })
                    .update({ endereco: address });
            }

            // Inserção em lote de order_items usando batchInsert para performance
            const orderItemsBatch = processedItems.map(i => ({
                order_id: order.id,
                product_id: i.product_id,
                quantidade: i.quantidade,
                preco_unitario: i.preco,
                titulo_snapshot: i.titulo,
                preco_snapshot: i.preco,
                custo_snapshot: i.custo,
                fornecedor_id_snapshot: i.fornecedor_id
            }));
            await trx.batchInsert('order_items', orderItemsBatch);

            // CORREÇÃO: Só deleta o carrinho se a origem da compra foi o carrinho
            if (fromCart) {
                const cartToDelete = await trx('carts').where({ user_id: userId }).first();
                if (cartToDelete) {
                    // PERFORMANCE: Deleta apenas os itens, mantendo o "container" do carrinho
                    // Isso evita um INSERT desnecessário na próxima vez que o usuário adicionar algo.
                    await trx('cart_items').where({ cart_id: cartToDelete.id }).del();
                }
            }

            // Decremento de estoque em lote (performance)
            const decrementQueries = consolidatedItems.map(item => {
                return trx('products')
                    .where({ id: item.product_id })
                    .decrement('estoque', item.quantidade);
            });
            await Promise.all(decrementQueries);

            // Enfileira job assíncrono - Tratamento de erro robusto
            try {
                await enqueuePaymentJob({
                    orderId: order.id,
                    items: processedItems,
                    orderTotal: total,
                    mpZeroCost: process.env.MP_ZERO_COST === 'true'
                });
            } catch (jobErr) {
                // Não interrompe a transação, apenas registra para auditoria
                // O job não foi enfileirado, o admin deverá processar manualmente ou o cliente tentará novamente
                await trx('orders')
                    .where({ id: order.id })
                    .update({
                        metadata: JSON.stringify({
                            paymentJobError: jobErr.message
                        })
                    });
                console.error('⚠️ Falha ao enfileirar job de pagamento:', jobErr);
            }

            return { order, processedItems };
        });

        // A resposta ao cliente é imediata; o job de pagamento atualizará o pedido depois
        // O frontend deve fazer polling no /checkout/status/:orderId
        res.status(201).json({
            order_id: orderData.order.id,
            total: orderData.order.total,
            payment_url: null,
            status: 'processing_payment'
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
