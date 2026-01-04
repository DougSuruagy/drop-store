require('dotenv').config();
const dns = require('dns');

// Vacina contra o erro de IPv6 do Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Mata o erro de certificado SSL globalmente
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Log para debug (aparecerá no seu log do Render para conferirmos o host)
if (process.env.DATABASE_URL) {
  const parts = process.env.DATABASE_URL.split('@');
  if (parts.length > 1) {
    console.log('Conectando ao banco em:', parts[1].split(':')[0]);
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
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 0, max: 5 },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
