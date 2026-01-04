/**
 * AURUM TECH - AutonomousSalesManager
 * O "Coração Ativo" da loja: Toma decisões baseadas em dados para maximizar conversão.
 */
const knex = require('../db');
const { REGRAS } = require('./LeanAI');

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
 * Recuperação Ativa de Carrinhos Abandonados
 */
async function activeCartRecovery() {
    console.log('🛒 [AutonomousManager] Buscando carrinhos abandonados...');

    try {
        // Encontra carrinhos modificados há mais de 1h e menos de 2h
        const threshold = new Date(Date.now() - 60 * 60 * 1000);
        const limit = new Date(Date.now() - 120 * 60 * 1000);

        const abandonedCarts = await knex('cart_items')
            .join('carts', 'cart_items.cart_id', 'carts.id')
            .join('users', 'carts.user_id', 'users.id')
            .where('cart_items.updated_at', '<', threshold)
            .andWhere('cart_items.updated_at', '>', limit)
            .select('users.email', 'users.nome', 'carts.id as cart_id')
            .distinct();

        for (const cart of abandonedCarts) {
            console.log(`📨 [AutonomousManager] Recuperação de carrinho para: ${cart.email}`);
            // TODO: Integrar com serviço de Email/WhatsApp para enviar cupom "AURUM10"
        }
    } catch (err) {
        console.error('❌ [AutonomousManager] Erro no CartRecovery:', err);
    }
}

module.exports = {
    activeInventoryManagement,
    activeCartRecovery
};
