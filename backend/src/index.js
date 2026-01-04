const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de Performance e Segurança
app.use(compression()); // GZIP
app.use(helmet());

// PERFORMANCE & SEGURANÇA: Limite de payload para evitar ataques de DoS (Denial of Service)
// 10kb é mais que suficiente para requisições de carrinho e checkout.
app.use(express.json({ limit: '10kb' }));

// Middleware de CORS robusto
const allowedOrigins = [
    'http://localhost:3000',
    'https://drop-store-rho.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como apps mobile ou chamadas server-side confiáveis)
        if (!origin) return callback(null, true);

        // Otimização: Verificação rápida de whitelist e subdomínios Vercel
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('CORS Policy: Origin não autorizado.'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// 404 Handler - Rota não encontrada
app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada no servidor Aurum Tech.' });
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
