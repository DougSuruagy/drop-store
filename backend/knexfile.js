require('dotenv').config();
const dns = require('dns');

// Vacina contra o erro de IPv6 do Render
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
      connectionString: (process.env.DATABASE_URL || '').trim(),
      ssl: { rejectUnauthorized: false },
      // O Supavisor (pooler do Supabase) às vezes exige o ID do projeto nos parâmetros
      application_name: 'wjnrvyxpklssvkscnqg'
    },
    pool: {
      min: 0,
      max: 4,
      acquireTimeoutMillis: 60000,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
