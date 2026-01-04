require('dotenv').config();
const dns = require('dns');

// Força IPv4 no Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erro de certificado SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Log para conferirmos o host no Render
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL.trim());
    console.log(`[Knex] Destino: ${url.hostname}, Porta: ${url.port}, User: ${url.username}`);
  } catch (e) {
    console.log('[Knex] Erro ao ler a URL');
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
      ssl: { rejectUnauthorized: false }
    },
    // Desativa prepared statements (essencial para o Pooler na porta 6543)
    searchPath: ['public'],
    pool: {
      min: 0,
      max: 4,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
