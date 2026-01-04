require('dotenv').config();
const dns = require('dns');

// Força IPv4 para o Render
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
      // PASSANDO DADOS EXPLICITOS PARA NÃO TER ERRO DE "TENANT"
      host: 'aws-1-sa-east-1.pooler.supabase.com',
      port: 6543,
      user: 'postgres.wjnrvyxpklssvkscnqg',
      password: 'Queuedoug1',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
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
