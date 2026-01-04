require('dotenv').config();
const dns = require('dns');
const { URL } = require('url');

// Força IPv4 no nível do DNS para evitar ENETUNREACH
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Desativa verificação de SSL (necessário para certificados auto-assinados do Supabase)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Função para extrair e validar a configuração do banco
 */
const getDatabaseConfig = () => {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) return { host: 'localhost' };

  try {
    const dbUrl = new URL(urlString);
    return {
      host: dbUrl.hostname,
      port: dbUrl.port || 5432,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.split('/')[1] || 'postgres',
      ssl: { rejectUnauthorized: false },
      // Configurações cruciais para o Pooler do Supabase em modo Transaction
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  } catch (err) {
    return { connectionString: urlString, ssl: { rejectUnauthorized: false } };
  }
};

const dbConfig = getDatabaseConfig();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' }
  },

  production: {
    client: 'pg',
    connection: dbConfig,
    pool: {
      min: 0,
      max: 10
    },
    // Desativa prepared statements que causam erro no Pooler porta 6543
    searchPath: ['public'],
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
