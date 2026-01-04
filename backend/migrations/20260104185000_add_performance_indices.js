exports.up = function (knex) {
    return knex.schema
        .table('orders', function (table) {
            table.index(['user_id', 'created_at']); // Otimiza listagem de pedidos por usuário
        })
        .table('cart_items', function (table) {
            table.index('cart_id'); // Otimiza busca de itens do carrinho
        })
        .table('order_items', function (table) {
            table.index('order_id'); // Otimiza busca de itens do pedido
        })
        .table('products', function (table) {
            table.index('categoria'); // Otimiza filtros por categoria
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('orders', function (table) { table.dropIndex(['user_id', 'created_at']); })
        .table('cart_items', function (table) { table.dropIndex('cart_id'); })
        .table('order_items', function (table) { table.dropIndex('order_id'); })
        .table('products', function (table) { table.dropIndex('categoria'); });
};
