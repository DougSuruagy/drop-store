require('dotenv').config();
const dns = require('dns');
const { URL } = require('url');

// Força IPv4 para evitar erro ENETUNREACH no Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Desativa verificação estrita de SSL para o Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Função para extrair dados da URL com segurança
const getDbConfig = () => {
  if (!process.env.DATABASE_URL) return {};
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      port: dbUrl.port || 5432,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.split('/')[1] || 'postgres',
    };
  } catch (e) {
    return { connectionString: process.env.DATABASE_URL };
  }
};

const config = getDbConfig();

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
      ...config,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
