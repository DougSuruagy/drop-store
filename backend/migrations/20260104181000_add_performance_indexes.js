exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.index(['user_id']);
    })
        .table('order_items', function (table) {
            table.index(['order_id']);
            table.index(['product_id']);
        })
        .table('carts', function (table) {
            table.index(['user_id']);
        })
        .table('cart_items', function (table) {
            table.index(['cart_id']);
            table.index(['product_id']);
        })
        .table('payments', function (table) {
            table.index(['order_id']);
        });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropIndex(['user_id']);
    })
        .table('order_items', function (table) {
            table.dropIndex(['order_id']);
            table.dropIndex(['product_id']);
        })
        .table('carts', function (table) {
            table.dropIndex(['user_id']);
        })
        .table('cart_items', function (table) {
            table.dropIndex(['cart_id']);
            table.dropIndex(['product_id']);
        })
        .table('payments', function (table) {
            table.dropIndex(['order_id']);
        });
};
