exports.up = function (knex) {
    return knex.schema.table('cart_items', function (table) {
        table.timestamp('updated_at').defaultTo(knex.fn.now()); // Essencial para o Cart Recovery
    });
};

exports.down = function (knex) {
    return knex.schema.table('cart_items', function (table) {
        table.dropColumn('updated_at');
    });
};
