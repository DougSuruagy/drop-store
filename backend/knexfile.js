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
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
};
