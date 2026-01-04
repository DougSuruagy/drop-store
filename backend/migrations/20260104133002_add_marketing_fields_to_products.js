/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('products', function (table) {
        table.jsonb('beneficios'); // Array de 3 benefícios
        table.text('prova_social'); // Frase de prova (Ex: +1000 vendidos)
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('products', function (table) {
        table.dropColumn('beneficios');
        table.dropColumn('prova_social');
    });
};
