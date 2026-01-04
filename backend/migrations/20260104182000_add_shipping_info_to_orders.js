exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.text('endereco_entrega');
        table.string('nome_cliente'); // Snapshot do nome no momento da compra
        table.string('email_cliente'); // Snapshot do email
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('endereco_entrega');
        table.dropColumn('nome_cliente');
        table.dropColumn('email_cliente');
    });
};
