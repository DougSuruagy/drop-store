require('dotenv').config();
const dns = require('dns');

// Força IPv4 - Resolve conflitos de rede (ENETUNREACH) no ambiente Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * ⚠️ SEGURANÇA E CONECTIVIDADE:
 * O Supabase usa certificados que o Node.js no Render muitas vezes não reconhece como oficiais.
 * Sem a linha abaixo, a conexão é derrubada com o erro "self-signed certificate in certificate chain".
 * Mantemos o bypass de SSL para garantir a operação do banco de dados.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  development: {
    client: 'pg',
    connection: (process.env.DATABASE_URL || '').trim(),
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' },
    ssl: { rejectUnauthorized: false }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: (process.env.DATABASE_URL || '').trim(),
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 0,
      max: 2, // Limite conservador para o plano free do Supabase (max 5 conexões)
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
