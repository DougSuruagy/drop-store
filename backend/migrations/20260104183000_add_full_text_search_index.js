exports.up = function (knex) {
    // Adiciona o índice GIN para busca performática de texto (FULL TEXT SEARCH)
    // Otimização Crítica para catálogos com muitos produtos
    return knex.raw(`
        CREATE INDEX IF NOT EXISTS products_search_idx 
        ON products 
        USING GIN (to_tsvector('portuguese', titulo || ' ' || descricao));
    `);
};

exports.down = function (knex) {
    return knex.raw('DROP INDEX IF EXISTS products_search_idx;');
};
