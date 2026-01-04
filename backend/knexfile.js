require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Resolve ENETUNREACH no Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// MATA O ERRO DE CERTIFICADO DE UMA VEZ POR TODAS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: (process.env.DATABASE_URL || '').trim(),
      // Configuração extrema para ignorar SSL no Postgres
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 2,
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
