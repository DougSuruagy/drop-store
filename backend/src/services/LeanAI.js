// src/services/LeanAI.js
/**
 * AURUM TECH – LEAN IA (Versão 1.0)
 * IA baseada em regras para validação de produtos e intermediação.
 */

class LeanAI {
    constructor() {
        this.MIN_PRICE = 97.00;
        this.MAX_PRICE = 497.00;
        this.MIN_MARGIN_PERCENT = 0.30; // 30% de margem mínima
        this.ESTIMATED_TAXES = 0.15;    // Taxas de checkout/intermediação
    }

    /**
     * Valida se um produto atende aos critérios obrigatórios do plano.
     */
    validateProduct(product) {
        const { titulo, preco, categoria } = product;

        // 1. Verificação de Preço
        if (preco < this.MIN_PRICE || preco > this.MAX_PRICE) {
            return { approved: false, reason: `Preço R$ ${preco} fora da faixa permitida (R$ 97 - R$ 497).` };
        }

        // 2. Verificação de Nicho (Baseada no plano Aurum Tech)
        const allowedCategories = ['Smart Home', 'Gadgets', 'Produtividade', 'Tech Automotivo', 'Decoração Tech'];
        if (!allowedCategories.includes(categoria)) {
            return { approved: false, reason: `Categoria ${categoria} não permitida.` };
        }

        // 3. Estimativa de Margem
        // Simulação: Fornecedor geralmente cobra 50-60% do preço final em intermediação simples.
        const estimatedSupplierCost = preco * 0.55;
        const profit = preco - estimatedSupplierCost - (preco * this.ESTIMATED_TAXES);
        const margin = profit / preco;

        if (margin < this.MIN_MARGIN_PERCENT) {
            return { approved: false, reason: `Margem estimada (${(margin * 100).toFixed(1)}%) abaixo do mínimo de 30%.` };
        }

        return {
            approved: true,
            analysis: {
                profit: profit.toFixed(2),
                margin: (margin * 100).toFixed(1) + '%',
                score: 85 // IA Score simulado
            }
        };
    }

    /**
     * Simula a busca e curadoria automática de produtos (Workflow Futuro)
     */
    async discoverTrends() {
        // Mock de busca em marketplaces
        return [
            { titulo: 'Aspirador Portátil UV', preco: 147.00, categoria: 'Gadgets' },
            { titulo: 'Fone Sono Profundo Bluetooth', preco: 127.00, categoria: 'Produtividade' }
        ];
    }
}

module.exports = new LeanAI();
