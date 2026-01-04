/**
 * AURUM TECH - Catálogo Inicial
 * 10 produtos validados pelo LeanAI
 * 
 * CRITÉRIOS:
 * ✅ Preço entre R$97 e R$497
 * ✅ Margem mínima de 40%
 * ✅ Baixo risco de devolução
 * ✅ Alto giro
 */

exports.seed = async function (knex) {
    // Limpa catálogo antigo
    await knex('products').del();

    // Catálogo Aurum Tech - Produtos Validados
    await knex('products').insert([
        {
            titulo: 'Organizador de Cabos Magnético Premium',
            descricao: 'Kit com 10 clipes magnéticos premium para organizar cabos USB, fones e carregadores. Acabamento emborrachado anti-risco. Perfeito para mesa de trabalho, cabeceira ou escritório.',
            preco: 97.00,
            preco_custo: 28.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']),
            estoque: 200,
            categoria: 'Organização',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['10 unidades', 'Magnético forte', 'Anti-risco', 'Universal']),
            prova_social: JSON.stringify({ vendidos: 3847, avaliacao: 4.8 })
        },
        {
            titulo: 'Suporte Notebook Ergonômico Alumínio',
            descricao: 'Suporte em alumínio sólido com ângulo ajustável em 6 posições. Ventilação otimizada, antiderrapante. Compatível com laptops de 10" a 17". Reduz dores no pescoço.',
            preco: 149.90,
            preco_custo: 42.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600']),
            estoque: 80,
            categoria: 'Produtividade',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Alumínio sólido', '6 ângulos', 'Ventilação', 'Ergonômico']),
            prova_social: JSON.stringify({ vendidos: 2156, avaliacao: 4.9 })
        },
        {
            titulo: 'Luminária LED Touch com Carregador Wireless',
            descricao: '3 temperaturas de cor (quente, neutra, fria), 10 níveis de brilho. Base com carregador wireless 15W para smartphone. Perfeita para home office. Economia de energia.',
            preco: 197.00,
            preco_custo: 58.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600']),
            estoque: 60,
            categoria: 'Smart Home',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Carregador wireless', 'Touch control', '3 cores', '10 brilhos']),
            prova_social: JSON.stringify({ vendidos: 1823, avaliacao: 4.7 })
        },
        {
            titulo: 'Hub USB-C 7 em 1 Pro',
            descricao: 'Hub multiportas: 2x USB 3.0, HDMI 4K@60Hz, SD/TF, USB-C PD 100W. Corpo em alumínio com dissipação de calor. Plug and play, sem drivers.',
            preco: 247.00,
            preco_custo: 72.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600']),
            estoque: 45,
            categoria: 'Gadgets',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['7 portas', 'HDMI 4K', 'PD 100W', 'Alumínio']),
            prova_social: JSON.stringify({ vendidos: 1456, avaliacao: 4.8 })
        },
        {
            titulo: 'Carregador Portátil 20000mAh Fast Charge',
            descricao: 'Power bank de alta capacidade com carregamento rápido 22.5W. Display LED digital, 3 portas (USB-A, USB-C, Micro). Carrega iPhone 14 até 5 vezes.',
            preco: 167.00,
            preco_custo: 48.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600']),
            estoque: 100,
            categoria: 'Gadgets',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['20000mAh', 'Fast Charge 22.5W', 'Display LED', '3 portas']),
            prova_social: JSON.stringify({ vendidos: 4231, avaliacao: 4.7 })
        },
        {
            titulo: 'Suporte Veicular Magnético 360°',
            descricao: 'Suporte magnético ultra forte para smartphone. Rotação 360°, instalação no ar-condicionado ou painel. Compatível com MagSafe. Não bloqueia ventilação.',
            preco: 117.00,
            preco_custo: 32.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']),
            estoque: 150,
            categoria: 'Tech Automotivo',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Magnético forte', '360°', 'MagSafe', 'Instalação fácil']),
            prova_social: JSON.stringify({ vendidos: 2987, avaliacao: 4.6 })
        },
        {
            titulo: 'Ring Light Profissional 26cm com Tripé',
            descricao: 'Iluminação profissional para lives, fotos e vídeos. Tripé ajustável até 2.1m, suporte para 2 celulares, controle remoto Bluetooth. 3 cores, 10 intensidades.',
            preco: 197.00,
            preco_custo: 56.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600']),
            estoque: 70,
            categoria: 'Gadgets',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Tripé 2.1m', 'Controle remoto', '2 suportes celular', '30 modos']),
            prova_social: JSON.stringify({ vendidos: 3654, avaliacao: 4.8 })
        },
        {
            titulo: 'Fone Bluetooth TWS com Cancelamento de Ruído',
            descricao: 'Som Hi-Fi com cancelamento de ruído ativo (ANC). Até 32h de bateria com estojo. Resistência IPX5 à água. Latência ultrabaixa para jogos.',
            preco: 247.00,
            preco_custo: 68.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600']),
            estoque: 55,
            categoria: 'Gadgets',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['ANC ativo', '32h bateria', 'IPX5', 'Baixa latência']),
            prova_social: JSON.stringify({ vendidos: 2145, avaliacao: 4.7 })
        },
        {
            titulo: 'Webcam Full HD 1080p com Microfone',
            descricao: 'Webcam profissional 1080p@30fps com foco automático. Microfone duplo com redução de ruído. Clip universal para notebook e monitor. Plug and play.',
            preco: 197.00,
            preco_custo: 55.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600']),
            estoque: 40,
            categoria: 'Produtividade',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['1080p Full HD', 'Foco automático', 'Mic duplo', 'Plug and play']),
            prova_social: JSON.stringify({ vendidos: 1876, avaliacao: 4.6 })
        },
        {
            titulo: 'Teclado Mecânico Compacto 60% RGB',
            descricao: 'Teclado mecânico compacto com switches azuis (clicky). Retroiluminação RGB personalizável. Cabo USB-C removível. Layout brasileiro ABNT2.',
            preco: 297.00,
            preco_custo: 85.00,
            imagens: JSON.stringify(['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600']),
            estoque: 35,
            categoria: 'Gadgets',
            fornecedor_id: 1,
            beneficios: JSON.stringify(['Switch mecânico', 'RGB customizável', 'USB-C', 'ABNT2']),
            prova_social: JSON.stringify({ vendidos: 1234, avaliacao: 4.9 })
        }
    ]);

    console.log('✅ Catálogo Aurum Tech inserido com sucesso!');
};
