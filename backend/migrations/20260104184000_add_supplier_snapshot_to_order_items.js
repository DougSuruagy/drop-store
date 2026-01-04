exports.up = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.integer('fornecedor_id_snapshot');
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.dropColumn('fornecedor_id_snapshot');
    });
};
