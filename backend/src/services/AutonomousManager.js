/**
 * AURUM TECH - AutonomousSalesManager
 * O "Coração Ativo" da loja: Toma decisões baseadas em dados para maximizar conversão.
 */
const knex = require('../db');
const { REGRAS } = require('./LeanAI');
const supplierBridge = require('./SupplierBridge');

/**
 * Analisa as tendências de estoque e aplica "Escassez Inteligente".
 * PERFORMANCE: Roda como um processo de fundo para não travar o servidor.
 */
async function activeInventoryManagement() {
    console.log('🤖 [AutonomousManager] Iniciando análise de inventário...');

    try {
        const products = await knex('products').select('id', 'titulo', 'estoque', 'preco', 'preco_custo');

        for (const product of products) {
            // Lógica 1: Escassez Crítica
            // Se o estoque estiver abaixo de 5 unidades, a IA pode sugerir um aumento leve de preço (5%)
            // para maximizar o lucro dos últimos itens, ou apenas monitorar.
            if (product.estoque > 0 && product.estoque <= 5) {
                console.log(`⚠️ [AutonomousManager] Baixo estoque detectado para "${product.titulo}" (${product.estoque} un).`);
                // Placeholder para gatilho de notificação de reestoque
            }

            // Lógica 2: Recuperação de Margem Ativa
            // Se o lucro líquido estiver abaixo da regra do LeanAI por oscilação de taxa/custo, 
            // a IA flagga o produto para revisão automática.
            const taxaMP = Number(product.preco) * REGRAS.TAXA_MP;
            const lucro = Number(product.preco) - Number(product.preco_custo) - taxaMP;
            const margem = lucro / Number(product.preco);

            if (margem < REGRAS.MARGEM_MINIMA) {
                console.warn(`🛑 [AutonomousManager] Margem de risco para "${product.titulo}": ${(margem * 100).toFixed(1)}%`);
                // Aqui poderíamos automatizar o ajuste de preço:
                // const novoPreco = preco * 1.1; 
                // await knex('products').where({id: product.id}).update({preco: novoPreco});
            }
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro:', err);
    }
}

/**
 * Recuperação Ativa de Carrinhos Abandonados (Protegido contra Spam)
 */
async function activeCartRecovery() {
    console.log('🛒 [AutonomousManager] Buscando carrinhos abandonados...');

    try {
        const threshold = new Date(Date.now() - 60 * 60 * 1000);
        const limit = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h limite

        const abandonedCarts = await knex('cart_items')
            .join('carts', 'cart_items.cart_id', 'carts.id')
            .join('users', 'carts.user_id', 'users.id')
            .where('carts.updated_at', '<', threshold)
            .andWhere('carts.updated_at', '>', limit)
            .whereNull('carts.last_recovery_at') // Só recupera se ainda não tentou
            .select('users.email', 'users.nome', 'carts.id as cart_id')
            .distinct();

        for (const cart of abandonedCarts) {
            console.log(`📨 [AutonomousManager] Recuperação de carrinho enviada para: ${cart.email}`);

            // Marca como recuperado para não enviar novamente
            await knex('carts').where({ id: cart.cart_id }).update({
                last_recovery_at: new Date()
            });
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro no CartRecovery:', err);
    }
}

/**
 * RECUPERAÇÃO ATIVA DE DESPACHOS (Crucial para Automação Total)
 * Busca pedidos que estão 'paid' mas não avançaram para 'processing'.
 * Isso acontece se o SupplierBridge falhou na primeira tentativa.
 */
async function retryFailedDispatches() {
    console.log('📦 [AutonomousManager] Verificando se há despachos represados...');

    try {
        const threshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutos parado em 'paid'

        const stagnantOrders = await knex('orders')
            .where({ status: 'paid' })
            .andWhere('updated_at', '<', threshold)
            .limit(10); // Processa em lotes para não sobrecarregar

        for (const order of stagnantOrders) {
            console.log(`🔄 [AutonomousManager] Tentando re-despacho automático para Pedido #${order.id}`);
            await supplierBridge.processarPedidoAprovado(order.id);
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro no RetryDispatches:', err);
    }
}

module.exports = {
    activeInventoryManagement,
    activeCartRecovery,
    retryFailedDispatches
};
