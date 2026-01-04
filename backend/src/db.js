const environment = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[environment];
const knex = require('knex')(config);

// Log para monitorar conexões em desenvolvimento
if (environment === 'development') {
    console.log(`[DB] Conectado ao banco de dados no ambiente: ${environment}`);
}

module.exports = knex;
