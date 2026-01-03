// knexfile.js – configuração para Supabase (PostgreSQL)
// Usa as variáveis de ambiente definidas em .env
require('dotenv').config();

/**
 * @type { import('knex').Knex.Config } 
 */
module.exports = {
  // Ambiente de desenvolvimento – aponta para o PostgreSQL da Supabase
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' },
    ssl: { rejectUnauthorized: false }
  },

  // Staging (caso queira usar outro BD) – mantém a mesma configuração
  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  },

  // Produção – idem ao development
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  },
};
