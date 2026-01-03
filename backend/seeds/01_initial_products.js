exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  await knex('suppliers').del();

  // Insert dummy supplier
  const [supplier] = await knex('suppliers').insert([
    { nome: 'Dropify Brasil', contato: 'contato@dropify.com.br', prazo_envio: '3-5 dias' }
  ]).returning('id');

  // Insert 10 initial products
  await knex('products').insert([
    {
      titulo: 'Capinha Ultra Resistente iPhone 15',
      descricao: 'Proteção máxima contra quedas e arranhões. Design fino e elegante.',
      preco: 49.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Capinha+iPhone']),
      estoque: 100,
      fornecedor_id: supplier.id,
      categoria: 'Acessórios'
    },
    {
      titulo: 'Carregador Sem Fio Fast Charge',
      descricao: 'Carregue seu celular sem cabos. Compatível com Android e iOS.',
      preco: 89.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Carregador+Wireless']),
      estoque: 50,
      fornecedor_id: supplier.id,
      categoria: 'Eletrônicos'
    },
    {
      titulo: 'Legging Fitness Alta Compressão',
      descricao: 'Conforto e estilo para seus treinos. Tecido respirável.',
      preco: 79.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Legging+Fitness']),
      estoque: 200,
      fornecedor_id: supplier.id,
      categoria: 'Moda'
    },
    {
      titulo: 'Garrafa Térmica Inteligente',
      descricao: 'Mantém a temperatura por 12h. Mostrador digital de temperatura.',
      preco: 59.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Garrafa+Termica']),
      estoque: 150,
      fornecedor_id: supplier.id,
      categoria: 'Casa'
    },
    {
      titulo: 'Brinquedo Interativo para Pets',
      descricao: 'Mantém seu pet entretido por horas. Material seguro.',
      preco: 39.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Pet+Toy']),
      estoque: 80,
      fornecedor_id: supplier.id,
      categoria: 'Pets'
    },
    {
      titulo: 'Organizador de Cozinha Multiuso',
      descricao: 'Otimize espaço na sua cozinha com este organizador prático.',
      preco: 45.00,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Organizador']),
      estoque: 120,
      fornecedor_id: supplier.id,
      categoria: 'Casa'
    },
    {
      titulo: 'Luminária LED de Mesa',
      descricao: 'Iluminação suave para leitura e trabalho. Bateria recarregável.',
      preco: 65.00,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Luminaria+LED']),
      estoque: 90,
      fornecedor_id: supplier.id,
      categoria: 'Decoração'
    },
    {
      titulo: 'Escova Facial Elétrica',
      descricao: 'Limpeza profunda e massagem facial. Pele radiante em minutos.',
      preco: 99.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Escova+Facial']),
      estoque: 60,
      fornecedor_id: supplier.id,
      categoria: 'Beleza'
    },
    {
      titulo: 'Fones Bluetooth Sport',
      descricao: 'Som de alta qualidade e resistência ao suor. Ideal para esportes.',
      preco: 129.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Fones+Bluetooth']),
      estoque: 40,
      fornecedor_id: supplier.id,
      categoria: 'Eletrônicos'
    },
    {
      titulo: 'Máscara de Skincare Hidratante',
      descricao: 'Kit com 5 máscaras para hidratação intensiva.',
      preco: 29.90,
      imagens: JSON.stringify(['https://via.placeholder.com/300?text=Mascara+Skincare']),
      estoque: 300,
      fornecedor_id: supplier.id,
      categoria: 'Beleza'
    }
  ]);
};
