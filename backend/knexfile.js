require('dotenv').config();
const dns = require('dns');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * @type { import('knex').Knex.Config }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL + (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=no-verify',
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
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
