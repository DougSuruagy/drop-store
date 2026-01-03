exports.up = async function (knex) {
    await knex.schema.dropTableIfExists('cart_items');
    await knex.schema.dropTableIfExists('carts');

    return knex.schema
        .createTable('carts', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        })
        .createTable('cart_items', function (table) {
            table.increments('id').primary();
            table.integer('cart_id').unsigned().references('id').inTable('carts').onDelete('CASCADE');
            table.integer('product_id').unsigned().references('id').inTable('products');
            table.integer('quantidade').notNullable().defaultTo(1);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('cart_items')
        .dropTableIfExists('carts');
};
