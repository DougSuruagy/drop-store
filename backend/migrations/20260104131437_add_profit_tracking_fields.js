/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .table('products', function (table) {
            table.decimal('preco_custo', 10, 2).defaultTo(0);
        })
        .table('orders', function (table) {
            table.decimal('lucro_liquido', 12, 2).defaultTo(0);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .table('products', function (table) {
            table.dropColumn('preco_custo');
        })
        .table('orders', function (table) {
            table.dropColumn('lucro_liquido');
        });
};
