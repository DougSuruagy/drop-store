/**
 * AURUM TECH - LeanAI
 * Sistema de Inteligência Artificial baseado em regras para curadoria de produtos.
 * 
 * PRINCÍPIOS:
 * - Nenhuma venda sem lucro
 * - Produtos entre R$97 e R$497
 * - Margem mínima de 40%
 * - Categorias validadas para dropshipping
 */

const REGRAS = {
    // Faixa de preço permitida
    PRECO_MINIMO: 97,
    PRECO_MAXIMO: 497,

    // Margem mínima sobre o custo (40% = 1.4x o custo)
    MARGEM_MINIMA: 0.40,

    // Taxa do Mercado Pago (estimativa conservadora)
    TAXA_MP: 0.05,

    // Categorias aprovadas para dropshipping (baixo risco de devolução)
    CATEGORIAS_APROVADAS: [
        'Gadgets',
        'Organização',
        'Smart Home',
        'Tech Automotivo',
        'Produtividade',
        'Acessórios',
        'Casa Inteligente',
        'Ferramentas',
        'Iluminação',
        'Carregadores'
    ],

    // Palavras-chave que indicam alto risco (evitar)
    BLACKLIST: [
        'frágil',
        'vidro',
        'bateria grande',
        'líquido',
        'químico',
        'medicamento',
        'suplemento',
        'comestível',
        'perecível'
    ]
};

/**
 * Valida se um produto atende aos critérios da Aurum Tech
 * @param {Object} produto - Objeto com dados do produto
 * @returns {Object} { approved: boolean, reason: string, score: number }
 */
function validateProduct(produto) {
    const resultado = {
        approved: true,
        reasons: [],
        score: 100,
        margem_estimada: 0,
        lucro_estimado: 0
    };

    const preco = Number(produto.preco) || 0;
    const custo = Number(produto.preco_custo) || 0;
    const categoria = produto.categoria || '';
    const descricao = (produto.descricao || '').toLowerCase();
    const titulo = (produto.titulo || '').toLowerCase();

    // REGRA 1: Faixa de preço
    if (preco < REGRAS.PRECO_MINIMO) {
        resultado.approved = false;
        resultado.reasons.push(`Preço R$ ${preco.toFixed(2)} abaixo do mínimo (R$ ${REGRAS.PRECO_MINIMO})`);
        resultado.score -= 50;
    }
    if (preco > REGRAS.PRECO_MAXIMO) {
        resultado.approved = false;
        resultado.reasons.push(`Preço R$ ${preco.toFixed(2)} acima do máximo (R$ ${REGRAS.PRECO_MAXIMO})`);
        resultado.score -= 30;
    }

    // REGRA 2: Margem mínima (Anti-Prejuízo)
    if (custo > 0) {
        const taxaMP = preco * REGRAS.TAXA_MP;
        const lucroLiquido = preco - custo - taxaMP;
        const margemReal = lucroLiquido / preco;

        resultado.margem_estimada = (margemReal * 100).toFixed(1) + '%';
        resultado.lucro_estimado = lucroLiquido.toFixed(2);

        if (margemReal < REGRAS.MARGEM_MINIMA) {
            resultado.approved = false;
            resultado.reasons.push(`Margem ${resultado.margem_estimada} abaixo do mínimo (${REGRAS.MARGEM_MINIMA * 100}%)`);
            resultado.score -= 40;
        }
    } else {
        resultado.reasons.push('Custo não informado - margem não calculada');
        resultado.score -= 10;
    }

    // REGRA 3: Categoria aprovada
    const categoriaAprovada = REGRAS.CATEGORIAS_APROVADAS.some(cat =>
        categoria.toLowerCase().includes(cat.toLowerCase())
    );
    if (!categoriaAprovada && categoria) {
        resultado.score -= 20;
        resultado.reasons.push(`Categoria "${categoria}" não está na lista prioritária`);
    }

    // REGRA 4: Blacklist (produtos de risco)
    const textoCompleto = `${titulo} ${descricao}`;
    const termoBloqueado = REGRAS.BLACKLIST.find(termo => textoCompleto.includes(termo));
    if (termoBloqueado) {
        resultado.approved = false;
        resultado.reasons.push(`Produto contém termo de risco: "${termoBloqueado}"`);
        resultado.score -= 50;
    }

    // REGRA 5: Descrição mínima (SEO)
    if (descricao.length < 50) {
        resultado.score -= 15;
        resultado.reasons.push('Descrição muito curta para SEO');
    }

    // Score final
    resultado.score = Math.max(0, resultado.score);

    // Resumo
    if (resultado.reasons.length === 0) {
        resultado.reasons.push('Produto aprovado - atende todos os critérios Aurum Tech');
    }

    return {
        approved: resultado.approved,
        reason: resultado.reasons.join('; '),
        score: resultado.score,
        margem: resultado.margem_estimada,
        lucro: resultado.lucro_estimado
    };
}

/**
 * Calcula o preço mínimo de venda para garantir margem
 * @param {number} custo - Custo do produto
 * @returns {number} Preço mínimo sugerido
 */
function calcularPrecoMinimo(custo) {
    // Preço = Custo / (1 - Margem - TaxaMP)
    const divisor = 1 - REGRAS.MARGEM_MINIMA - REGRAS.TAXA_MP;
    const precoMinimo = custo / divisor;

    // Arredonda para .90 (psicologia de preço)
    return Math.ceil(precoMinimo / 10) * 10 - 0.10;
}

/**
 * Verifica se uma venda pode ser processada (Anti-Prejuízo no checkout)
 * @param {number} precoVenda - Preço de venda
 * @param {number} custoProduto - Custo do produto
 * @returns {Object} { allowed: boolean, message: string }
 */
function validarVenda(precoVenda, custoProduto) {
    // Se o custo for 0 (produto digital ou não cadastrado), liberamos a venda
    // Isso é útil para testes ou produtos de "isca"
    if (!custoProduto || custoProduto <= 0) {
        return {
            allowed: true,
            message: 'Venda aprovada (Custo Zero/Desconhecido)',
            lucro: precoVenda.toFixed(2),
            margem: '100%'
        };
    }

    const mpZeroCost = process.env.MP_ZERO_COST === 'true';
    const taxaMP = mpZeroCost ? 0 : precoVenda * REGRAS.TAXA_MP;

    const lucro = precoVenda - custoProduto - taxaMP;
    const margem = lucro / precoVenda;

    // Se estivermos em modo Zero Cost (Crescimento Agressivo), podemos relaxar a margem mínima para 10%
    // ou manter a regra original se não for especificado.
    const margemMinimaEfetiva = mpZeroCost ? 0.10 : REGRAS.MARGEM_MINIMA;

    if (margem < margemMinimaEfetiva) {
        return {
            allowed: false,
            message: `Venda bloqueada: margem de ${(margem * 100).toFixed(1)}% é inferior ao mínimo de ${margemMinimaEfetiva * 100}%`,
            lucro: lucro.toFixed(2),
            margem: (margem * 100).toFixed(1) + '%'
        };
    }

    return {
        allowed: true,
        message: 'Venda aprovada',
        lucro: lucro.toFixed(2),
        margem: (margem * 100).toFixed(1) + '%'
    };
}

module.exports = {
    validateProduct,
    calcularPrecoMinimo,
    validarVenda,
    REGRAS
};
