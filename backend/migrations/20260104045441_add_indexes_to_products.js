exports.up = function (knex) {
    return knex.schema.table('products', function (table) {
        table.index(['categoria']);
        table.index(['titulo']);
    });
};

exports.down = function (knex) {
    return knex.schema.table('products', function (table) {
        table.dropIndex(['categoria']);
        table.dropIndex(['titulo']);
    });
};
