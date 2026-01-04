require('dotenv').config();
const dns = require('dns');

// Força aceitar certificados do Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Resolve IPv6 do Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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
      // Configurações críticas para o Pooler do Supabase
      ssl: { rejectUnauthorized: false },
      application_name: 'drop-store'
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
