require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
    const url = process.env.DATABASE_URL;
    console.log('--- TESTE DE CONEXÃO SUPABASE ---');
    console.log('URL recebida do Render:', url ? url.replace(/:([^:@]+)@/, ':****@') : 'VAZIA');

    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Tentando conectar...');
        await client.connect();
        console.log('✅ SUCESSO! Conexão estabelecida.');
        const res = await client.query('SELECT NOW()');
        console.log('Hora do Banco:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ ERRO NA CONEXÃO:');
        console.error('Mensagem:', err.message);
        console.error('Código do Erro:', err.code);
        console.log('\nDICA: Se o erro for "Tenant not found", o ID do projeto ou o HOST estão errados.');
    }
}

testConnection();
