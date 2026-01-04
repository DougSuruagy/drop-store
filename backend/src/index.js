const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de Segurança
const allowedOrigins = [
    'http://localhost:3000',
    'https://drop-store-rho.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or is a Vercel deployment
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        const msg = 'A política CORS deste site não permite acesso do Origin especificado.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const webhookRoutes = require('./routes/webhooks');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic DB check
app.get('/api/db-debug', async (req, res) => {
    try {
        const knex = require('./db');
        const result = await knex.raw('SELECT 1+1 AS result');
        res.json({ status: 'connected', result: result.rows[0].result });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            code: err.code
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Inicia o servidor e roda migrations programaticamente
const startServer = async () => {
    try {
        console.log('📦 Iniciando banco de dados...');
        const knex = require('./db');

        // Roda migrations
        await knex.migrate.latest();
        console.log('✅ Migrations concluídas.');

        // Roda seeds (Sempre tenta garantir que existam produtos)
        const productsCount = await knex('products').count('id as count').first();
        if (parseInt(productsCount.count) === 0) {
            console.log('🌱 Banco vazio. Rodando seeds...');
            await knex.seed.run();
            console.log('✅ Seeds concluídos.');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Backend rodando na porta ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Falha ao iniciar o servidor:', err);
        // Em caso de erro grave no banco, sobe o servidor para diagnóstico
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Modo de Emergência (Erro Banco) na porta ${PORT}`);
        });
    }
};

startServer();
