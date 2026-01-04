exports.up = function (knex) {
    return knex.schema
        .createTable('order_logs', function (table) {
            table.increments('id').primary();
            table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
            table.string('tipo').notNullable(); // 'ENVIADO_FORNECEDOR', 'ERRO_FORNECEDOR', 'PAGAMENTO_APROVADO'
            table.text('detalhes');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .table('carts', function (table) {
            table.timestamp('last_recovery_at'); // Para evitar spam na recuperação de carrinho
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('order_logs')
        .table('carts', function (table) {
            table.dropColumn('last_recovery_at');
        });
};
