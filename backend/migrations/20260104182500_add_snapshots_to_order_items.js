exports.up = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.string('titulo_snapshot');
        table.decimal('preco_snapshot', 10, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.dropColumn('titulo_snapshot');
        table.dropColumn('preco_snapshot');
    });
};
