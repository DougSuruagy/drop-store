require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Essencial no Render)
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
      connectionString: process.env.DATABASE_URL,
      // Garante que o SSL seja tratado corretamente pelo driver nativo
      ssl: { rejectUnauthorized: false }
    },
    // Limita o pool para não estourar as conexões do plano grátis do Supabase
    pool: {
      min: 0,
      max: 3,
      idleTimeoutMillis: 30000,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
