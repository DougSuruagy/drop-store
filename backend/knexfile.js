require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Essencial para o Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Ignora erro de certificado SSL globalmente
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Log seguro para conferir o host no Render
if (process.env.DATABASE_URL) {
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log('[Knex] Usando URL:', maskedUrl.split('@')[1] || 'URL malformada');
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
