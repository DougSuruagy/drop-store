require('dotenv').config();
const dns = require('dns');

// Força IPv4 para o Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erro de certificado SSL
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
      // O segredo para o erro "Tenant not found" no Render é limpar a URL e garantir o SSL
      connectionString: (process.env.DATABASE_URL || '').trim(),
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 4,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
