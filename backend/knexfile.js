require('dotenv').config();
const dns = require('dns');

// Força IPv4 (Essencial para o Render encontrar o Supabase)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Desativa a verificação de SSL que causa erro no Render
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
    // Usamos a string de conexão DIRETA. O segredo está no formato da string no Render!
    connection: process.env.DATABASE_URL,
    pool: {
      min: 0,
      max: 2, // Limite baixo para o plano free do Supabase
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
