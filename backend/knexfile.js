require('dotenv').config();
const dns = require('dns');

// Força IPv4 para o Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erros de certificado (auto-assinado)
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
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 60000,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
