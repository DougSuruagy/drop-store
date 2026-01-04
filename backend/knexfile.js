require('dotenv').config();
const dns = require('dns');

// FORÇA O NODE A ACEITAR CERTIFICADOS SELF-SIGNED (COMUM NO RENDER/SUPABASE)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Resolve o problema de IPv6 do Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * @type { import('knex').Knex.Config }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      family: 4
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
