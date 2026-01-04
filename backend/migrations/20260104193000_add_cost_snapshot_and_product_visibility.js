exports.up = function (knex) {
    return knex.schema
        .table('order_items', function (table) {
            table.decimal('custo_snapshot', 10, 2); // Mantém o custo histórico para precisão financeira
        })
        .table('products', function (table) {
            table.boolean('visivel').defaultTo(true).index(); // Permite desativação automática de produtos sem lucro
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('order_items', function (table) { table.dropColumn('custo_snapshot'); })
        .table('products', function (table) { table.dropColumn('visivel'); });
};
