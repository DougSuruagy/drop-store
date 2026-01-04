require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Resolve ENETUNREACH)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Mata o erro de certificado globalmente
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
    // Usamos a string direta para evitar erros de parsing de objeto
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 30000,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
