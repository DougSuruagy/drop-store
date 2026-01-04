require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Essencial para o Render)
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
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    // Limita o pool para não estourar as conexões do plano grátis
    pool: {
      min: 0,
      max: 2,
    },
    // Desativa cache de statements que o Pooler do Supabase rejeita
    migrations: {
      tableName: 'knex_migrations',
      disableTransactions: false // Mantém transações para segurança
    }
  }
};
