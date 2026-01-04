exports.up = function (knex) {
    return knex.schema.table('products', function (table) {
        if (!knex.schema.hasColumn('products', 'created_at')) {
            table.timestamps(true, true); // Adiciona created_at e updated_at
        }
    });
};

exports.down = function (knex) {
    return knex.schema.table('products', function (table) {
        table.dropTimestamps();
    });
};
