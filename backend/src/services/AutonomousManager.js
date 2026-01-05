/**
 * AURUM TECH - AutonomousSalesManager
 * O "Coração Ativo" da loja: Toma decisões baseadas em dados para maximizar conversão.
 */
const knex = require('../db');
const { REGRAS } = require('./LeanAI');
const supplierBridge = require('./SupplierBridge');
const { productCache } = require('../routes/products');

/**
 * Analisa as tendências de estoque e aplica "Escassez Inteligente".
 */
async function activeInventoryManagement() {
    console.log('🤖 [AutonomousManager] Iniciando análise de inventário e margens...');

    try {
        const products = await knex('products').select('id', 'titulo', 'estoque', 'preco', 'preco_custo');

        for (const product of products) {
            // Lógica 1: Escassez Crítica
            if (product.estoque > 0 && product.estoque <= 5) {
                console.log(`⚠️ [AutonomousManager] Baixo estoque detectado para "${product.titulo}" (${product.estoque} un).`);
            }

            // Lógica 2: Recuperação de Margem Ativa (Inflação/Prejuízo)
            const taxaMP = Number(product.preco) * REGRAS.TAXA_MP;
            const lucro = Number(product.preco) - Number(product.preco_custo) - taxaMP;
            const margem = lucro / Number(product.preco);

            if (margem < REGRAS.MARGEM_MINIMA) {
                // EVOLUÇÃO ATIVA: IA corrige o preço automaticamente para restaurar a margem mínima
                // Preço Sugerido = Custo / (1 - MargemAlvo - TaxaMP)
                const divisor = 1 - REGRAS.MARGEM_MINIMA - REGRAS.TAXA_MP;
                const novoPreco = Number(product.preco_custo) / divisor;

                // Arredonda para cima no centavo .90 (Psicologia de Preço)
                const precoFormatado = (Math.ceil(novoPreco / 1) * 1 - 0.10).toFixed(2);

                console.warn(`⚖️ [AutonomousManager] Ajuste de Preço Automático para "${product.titulo}": R$ ${product.preco} -> R$ ${precoFormatado} (Restaurando margem de ${REGRAS.MARGEM_MINIMA * 100}%)`);

                await knex('products').where({ id: product.id }).update({
                    preco: precoFormatado,
                    visivel: true, // Garante visibilidade
                    updated_at: new Date()
                });

                // PERFORMANCE: Limpa o cache para que os clientes vejam o preço atualizado imediatamente
                productCache.delete(product.id.toString());
            }
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro no InventoryManagement:', err);
    }
}

/**
 * Recuperação Ativa de Carrinhos Abandonados (Protegido contra Spam)
 */
async function activeCartRecovery() {
    console.log('🛒 [AutonomousManager] Buscando carrinhos abandonados...');

    try {
        const threshold = new Date(Date.now() - 60 * 60 * 1000);
        const limit = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const abandonedCarts = await knex('cart_items')
            .join('carts', 'cart_items.cart_id', 'carts.id')
            .join('users', 'carts.user_id', 'users.id')
            .where('carts.updated_at', '<', threshold)
            .andWhere('carts.updated_at', '>', limit)
            .whereNull('carts.last_recovery_at')
            .select('users.email', 'users.nome', 'carts.id as cart_id')
            .distinct();

        for (const cart of abandonedCarts) {
            console.log(`📨 [AutonomousManager] Recuperação de carrinho enviada para: ${cart.email}`);

            await knex('carts').where({ id: cart.cart_id }).update({
                last_recovery_at: new Date()
            });
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro no CartRecovery:', err);
    }
}

/**
 * RECUPERAÇÃO ATIVA DE DESPACHOS
 */
async function retryFailedDispatches() {
    console.log('📦 [AutonomousManager] Verificando se há despachos represados...');

    try {
        const threshold = new Date(Date.now() - 15 * 60 * 1000);

        const stagnantOrders = await knex('orders')
            .where({ status: 'paid' })
            .andWhere('updated_at', '<', threshold)
            .limit(20);

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
