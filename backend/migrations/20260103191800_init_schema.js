// Migration: create initial tables for dropshipping store
exports.up = function (knex) {
    return knex.schema
        // users table
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('email').notNullable().unique();
            table.string('senha_hash').notNullable();
            table.string('endereco');
            table.string('telefone');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        // suppliers table
        .createTable('suppliers', function (table) {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('contato');
            table.string('api_endpoint');
            table.string('prazo_envio');
        })
        // products table
        .createTable('products', function (table) {
            table.increments('id').primary();
            table.string('titulo').notNullable();
            table.text('descricao');
            table.decimal('preco', 10, 2).notNullable();
            table.jsonb('imagens'); // array of image URLs
            table.integer('estoque').defaultTo(0);
            table.integer('fornecedor_id').unsigned().references('id').inTable('suppliers').onDelete('SET NULL');
            table.string('categoria');
        })
        // orders table
        .createTable('orders', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.decimal('total', 12, 2).notNullable();
            table.enu('status', ['pending', 'paid', 'shipped', 'delivered', 'canceled']).defaultTo('pending');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        // order_items table
        .createTable('order_items', function (table) {
            table.increments('id').primary();
            table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
            table.integer('product_id').unsigned().references('id').inTable('products');
            table.integer('quantidade').notNullable();
            table.decimal('preco_unitario', 10, 2).notNullable();
        })
        // payments table
        .createTable('payments', function (table) {
            table.increments('id').primary();
            table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
            table.string('metodo').notNullable();
            table.enu('status', ['pending', 'paid', 'failed']).defaultTo('pending');
            table.decimal('valor', 12, 2).notNullable();
            table.string('provider_id');
        })
        // shipments table
        .createTable('shipments', function (table) {
            table.increments('id').primary();
            table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
            table.string('tracking_code');
            table.string('carrier');
            table.enu('status', ['pending', 'in_transit', 'delivered']).defaultTo('pending');
            table.timestamp('estimated_delivery');
        })
        // returns table
        .createTable('returns', function (table) {
            table.increments('id').primary();
            table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
            table.text('motivo');
            table.enu('status', ['requested', 'approved', 'rejected', 'refunded']).defaultTo('requested');
            table.timestamp('data').defaultTo(knex.fn.now());
            table.decimal('refund_value', 12, 2);
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('returns')
        .dropTableIfExists('shipments')
        .dropTableIfExists('payments')
        .dropTableIfExists('order_items')
        .dropTableIfExists('orders')
        .dropTableIfExists('products')
        .dropTableIfExists('suppliers')
        .dropTableIfExists('users');
};
