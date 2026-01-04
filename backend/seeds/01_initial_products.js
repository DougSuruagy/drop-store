exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  await knex('suppliers').del();

  // Insert dummy supplier (as per business model: intermediaries)
  const [supplier] = await knex('suppliers').insert([
    { nome: 'Global Tech Intermediações', contato: 'fulfillment@globaltech.com', prazo_envio: '7-15 dias' }
  ]).returning('id');

  // Insert 10 initial products aligned with PLAINTEXT ZERO criteria (R$ 97 - R$ 497)
  await knex('products').insert([
    {
      titulo: 'Smart Hub Hub 360° - Automação Residencial',
      descricao: 'Controle todos os seus dispositivos infravermelhos pelo celular. Compatível com Alexa e Google Home.',
      preco: 147.00,
      preco_custo: 65.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1558002038-1055907df8d7?q=80&w=800']),
      estoque: 100,
      fornecedor_id: supplier.id,
      categoria: 'Smart Home',
      beneficios: JSON.stringify(['Instalação em 2 minutos', 'Economia de energia real', 'Controle por voz total']),
      prova_social: '+1.500 casas automatizadas este mês'
    },
    {
      titulo: 'Projetor Cinematic Pocket 4K',
      descricao: 'Transforme qualquer parede em um cinema de 120 polegadas. Portátil e com Wi-Fi integrado.',
      preco: 397.00,
      preco_custo: 180.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1535016120720-40c646bebbdc?q=80&w=800']),
      estoque: 50,
      fornecedor_id: supplier.id,
      categoria: 'Gadgets',
      beneficios: JSON.stringify(['Cinema em qualquer lugar', 'Conexão sem fios ultra-rápida', 'Bateria de longa duração']),
      prova_social: 'Eleito o melhor gadget de 2025'
    },
    {
      titulo: 'Teclado Mecânico Ultra-Slim RGB',
      descricao: 'Produtividade e ergonomia com switches premium. Conexão Bluetooth para até 3 dispositivos.',
      preco: 289.90,
      preco_custo: 130.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800']),
      estoque: 75,
      fornecedor_id: supplier.id,
      categoria: 'Produtividade',
      beneficios: JSON.stringify(['Escrita sem fadiga', 'Design ultra fino e elegante', 'Bateria para 30 dias']),
      prova_social: 'Usado por 500+ desenvolvedores sênior'
    },
    {
      titulo: 'Câmera Veicular Dual Lens Blackbox',
      descricao: 'Gravação em 4K e visão noturna. Segurança total para suas viagens com sensor de colisão.',
      preco: 327.00,
      preco_custo: 150.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1502945015378-0e28404a5adc?q=80&w=800']),
      estoque: 60,
      fornecedor_id: supplier.id,
      categoria: 'Tech Automotivo',
      beneficios: JSON.stringify(['Proteção jurídica em acidentes', 'Gravação cristalina à noite', 'Instalação invisível']),
      prova_social: 'Reduz stress no trânsito em 80%'
    },
    {
      titulo: 'Aspirador Robot Slim Pro',
      descricao: 'Varre e aspira automaticamente. Sensor anti-queda e retorno inteligente para a base.',
      preco: 497.00,
      preco_custo: 240.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=800']),
      estoque: 30,
      fornecedor_id: supplier.id,
      categoria: 'Smart Home',
      beneficios: JSON.stringify(['Ganhe 2h extras por dia', 'Limpeza em cantos difíceis', 'Silencioso e eficiente']),
      prova_social: 'Livre-se da vassoura para sempre'
    },
    {
      titulo: 'Monitor de Qualidade do Ar Wi-Fi',
      descricao: 'Detecta CO2, umidade e formaldeído em tempo real. Essencial para saúde no home office.',
      preco: 187.50,
      preco_custo: 85.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800']),
      estoque: 120,
      fornecedor_id: supplier.id,
      categoria: 'Gadgets',
      beneficios: JSON.stringify(['Previne alergias e rinites', 'Alertas no celular em tempo real', 'Melhora o foco no trabalho']),
      prova_social: 'Recomendado para home office produtivo'
    },
    {
      titulo: 'Carregador Solar PowerBank 20.000mAh',
      descricao: 'Energia infinita para suas aventuras. Resistente à água e com lanterna SOS.',
      preco: 214.00,
      preco_custo: 95.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1619131608674-683a37397799?q=80&w=800']),
      estoque: 90,
      fornecedor_id: supplier.id,
      categoria: 'Tech Automotivo',
      beneficios: JSON.stringify(['Nunca fique sem bateria', 'Resistência militar contra quedas', 'Carrega 3 aparelhos ao mesmo tempo']),
      prova_social: 'O melhor amigo do aventureiro'
    },
    {
      titulo: 'Luminária Anti-Gravidade HoverLamp',
      descricao: 'Design futurista com carregamento wireless por indução na base. O topo flutua de verdade.',
      preco: 347.00,
      preco_custo: 160.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1542738221-872f7d54976c?q=80&w=800']),
      estoque: 40,
      fornecedor_id: supplier.id,
      categoria: 'Decoração Tech',
      beneficios: JSON.stringify(['Peça única de conversa', 'Tecnologia de levitação real', 'Carregamento ultra-rápido']),
      prova_social: 'Pura magia tecnológica na sua mesa'
    },
    {
      titulo: 'Headset Noise Cancelling V8',
      descricao: 'Cancelamento de ruído ativo para foco total. Microfone de estúdio para reuniões nítidas.',
      preco: 459.90,
      preco_custo: 210.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800']),
      estoque: 55,
      fornecedor_id: supplier.id,
      categoria: 'Produtividade',
      beneficios: JSON.stringify(['Silêncio absoluto em segundos', 'Conforto para o dia inteiro', 'Bateria de 40 horas']),
      prova_social: 'Transforme qualquer café em escritório'
    },
    {
      titulo: 'Kit Organizador Inteligente de Mesa',
      descricao: 'Gerenciamento de cabos e carregadores integrados. Mantenha seu setup limpo e produtivo.',
      preco: 127.00,
      preco_custo: 55.00,
      imagens: JSON.stringify(['https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?q=80&w=800']),
      estoque: 150,
      fornecedor_id: supplier.id,
      categoria: 'Produtividade',
      beneficios: JSON.stringify(['Setup limpo em 5 minutos', 'Aumenta espaço útil na mesa', 'Design minimalista premium']),
      prova_social: 'O fim da bagunça com cabos'
    }
  ]);
};
