/**
 * SEED: Produtos Reais para DropStore
 * 
 * COMO USAR:
 * 1. Substitua as URLs das imagens por imagens reais dos produtos
 * 2. Ajuste preços, descrições e estoque conforme necessário
 * 3. Execute: npx knex seed:run --specific=02_real_products.js
 */

exports.seed = async function (knex) {
    // Deleta produtos antigos (placeholder)
    await knex('products').del();

    // Insere produtos reais
    await knex('products').insert([
        {
            titulo: 'Fone Bluetooth TWS Pro',
            descricao: 'Som cristalino, cancelamento de ruído ativo, até 24h de bateria com o estojo. Resistente à água IPX5. Conexão instantânea com iOS e Android.',
            preco: 149.90,
            preco_custo: 45.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600']),
            estoque: 50,
            categoria: 'Eletrônicos',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Cancelamento de ruído', '24h de bateria', 'IPX5']),
            prova_social: JSON.stringify({ vendidos: 1247, avaliacao: 4.8 })
        },
        {
            titulo: 'Smartwatch Fitness Pro',
            descricao: 'Monitor cardíaco, oxímetro, GPS integrado, mais de 100 modos de treino. Bateria de 7 dias. Tela AMOLED vibrante.',
            preco: 299.90,
            preco_custo: 95.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600']),
            estoque: 30,
            categoria: 'Eletrônicos',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['GPS integrado', '7 dias de bateria', 'Tela AMOLED']),
            prova_social: JSON.stringify({ vendidos: 856, avaliacao: 4.7 })
        },
        {
            titulo: 'Mochila Anti-Furto Urban',
            descricao: 'Compartimento oculto para notebook 15", porta USB externa, tecido impermeável. Design moderno para trabalho ou viagem.',
            preco: 189.90,
            preco_custo: 55.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600']),
            estoque: 40,
            categoria: 'Acessórios',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Anti-furto', 'Porta USB', 'Impermeável']),
            prova_social: JSON.stringify({ vendidos: 2341, avaliacao: 4.9 })
        },
        {
            titulo: 'Luminária LED de Mesa Touch',
            descricao: '3 temperaturas de cor, 10 níveis de brilho, carregador wireless integrado. Perfeita para home office.',
            preco: 129.90,
            preco_custo: 38.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600']),
            estoque: 60,
            categoria: 'Casa',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Touch control', 'Carregador wireless', '3 cores de luz']),
            prova_social: JSON.stringify({ vendidos: 1876, avaliacao: 4.6 })
        },
        {
            titulo: 'Garrafa Térmica Inteligente',
            descricao: 'Mantém bebidas geladas por 24h ou quentes por 12h. Display LED de temperatura. Capacidade 500ml.',
            preco: 99.90,
            preco_custo: 28.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600']),
            estoque: 100,
            categoria: 'Casa',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Display LED', '24h gelada', '12h quente']),
            prova_social: JSON.stringify({ vendidos: 3542, avaliacao: 4.8 })
        },
        {
            titulo: 'Organizador de Cabos Magnético',
            descricao: 'Kit com 6 clipes magnéticos para organizar cabos USB, fones e carregadores. Acabamento premium.',
            preco: 49.90,
            preco_custo: 12.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']),
            estoque: 200,
            categoria: 'Acessórios',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['6 unidades', 'Magnético', 'Universal']),
            prova_social: JSON.stringify({ vendidos: 5123, avaliacao: 4.5 })
        },
        {
            titulo: 'Ring Light Profissional 26cm',
            descricao: 'Iluminação profissional para lives, fotos e vídeos. Tripé ajustável, suporte para celular, controle de intensidade.',
            preco: 119.90,
            preco_custo: 35.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600']),
            estoque: 45,
            categoria: 'Eletrônicos',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Tripé incluso', '3 temperaturas', 'Suporte celular']),
            prova_social: JSON.stringify({ vendidos: 2789, avaliacao: 4.7 })
        },
        {
            titulo: 'Capa iPhone Premium MagSafe',
            descricao: 'Proteção militar, compatível com carregador MagSafe, design ultra-fino. Disponível para iPhone 14/15.',
            preco: 79.90,
            preco_custo: 18.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600']),
            estoque: 150,
            categoria: 'Acessórios',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['MagSafe', 'Proteção militar', 'Ultra-fino']),
            prova_social: JSON.stringify({ vendidos: 4567, avaliacao: 4.9 })
        },
        {
            titulo: 'Suporte Notebook Ergonômico',
            descricao: 'Alumínio premium, ângulo ajustável, ventilação otimizada. Compatível com laptops de 10" a 17".',
            preco: 159.90,
            preco_custo: 42.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600']),
            estoque: 35,
            categoria: 'Acessórios',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Alumínio', 'Ajustável', 'Ventilação']),
            prova_social: JSON.stringify({ vendidos: 1234, avaliacao: 4.8 })
        },
        {
            titulo: 'Mini Projetor Portátil HD',
            descricao: 'Resolução 1080p nativa, até 120" de tela, conexão WiFi e Bluetooth. Ideal para filmes e apresentações.',
            preco: 449.90,
            preco_custo: 180.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600']),
            estoque: 20,
            categoria: 'Eletrônicos',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['1080p nativo', 'WiFi + Bluetooth', 'Até 120"']),
            prova_social: JSON.stringify({ vendidos: 678, avaliacao: 4.6 })
        },
        {
            titulo: 'Carregador Portátil 20000mAh',
            descricao: 'Power bank de alta capacidade, carregamento rápido 22.5W, display digital, 3 portas USB.',
            preco: 139.90,
            preco_custo: 40.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600']),
            estoque: 80,
            categoria: 'Eletrônicos',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['20000mAh', 'Fast Charge 22.5W', '3 portas']),
            prova_social: JSON.stringify({ vendidos: 3890, avaliacao: 4.7 })
        },
        {
            titulo: 'Massageador Cervical Elétrico',
            descricao: 'Alívio instantâneo para dores no pescoço e ombros. 4 modos de massagem, aquecimento infravermelho.',
            preco: 179.90,
            preco_custo: 52.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600']),
            estoque: 55,
            categoria: 'Saúde',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Aquecimento', '4 modos', 'Portátil']),
            prova_social: JSON.stringify({ vendidos: 2156, avaliacao: 4.8 })
        }
    ]);
};
