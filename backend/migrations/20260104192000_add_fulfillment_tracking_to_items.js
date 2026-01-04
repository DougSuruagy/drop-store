exports.up = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.boolean('notificado_fornecedor').defaultTo(false);
        table.timestamp('data_notificacao_fornecedor');
    });
};

exports.down = function (knex) {
    return knex.schema.table('order_items', function (table) {
        table.dropColumn('notificado_fornecedor');
        table.dropColumn('data_notificacao_fornecedor');
    });
};
