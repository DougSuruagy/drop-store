require('dotenv').config();
const dns = require('dns');

// Força IPv4 - Essencial para evitar erros ENETUNREACH no Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * SEGURANÇA: Removemos process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
 * Em vez de desativar a segurança de TODO o sistema (o que afetaria o PagSeguro),
 * configuramos o SSL especificamente para o banco de dados abaixo.
 */

module.exports = {
  development: {
    client: 'pg',
    connection: (process.env.DATABASE_URL || '').trim(),
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' },
    // Adicionamos SSL local para caso o dev use Supabase remoto também
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')
      ? { rejectUnauthorized: false }
      : false
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: (process.env.DATABASE_URL || '').trim(),
      // Aqui configuramos para aceitar o certificado do Supabase sem comprometer o resto da App
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 2, // Mantemos baixo para o plano free do Supabase (limite de 5 conexões totais)
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
