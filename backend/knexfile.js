require('dotenv').config();
const dns = require('dns');

// Vacina contra o erro de IPv6 do Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erro de certificado SSL globalmente
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
    },
    // Configurações específicas para evitar o erro de Tenant no Supavisor
    pool: {
      min: 0,
      max: 2, // Manter o pool baixo no plano free
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
