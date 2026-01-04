require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Resolve ENETUNREACH no Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erro de certificado SSL do Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Log Forense para o Render (ajuda a achar erros de digitação na URL)
if (process.env.DATABASE_URL) {
  try {
    const rawUrl = process.env.DATABASE_URL.trim();
    const url = new URL(rawUrl);
    console.log(`[Knex Debug] Host: ${url.hostname}, Port: ${url.port}, User: ${url.username}`);
  } catch (e) {
    console.log('[Knex Debug] Erro ao ler a URL: ', e.message);
  }
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
      connectionString: (process.env.DATABASE_URL || '').trim(),
      ssl: { rejectUnauthorized: false },
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
