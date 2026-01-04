// src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware de Segurança
const allowedOrigins = [
    'http://localhost:3000',
    'https://drop-store-rho.vercel.app' // Link da sua loja na Vercel
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como apps mobile ou curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política CORS deste site não permite acesso do Origin especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhooks');
const orderRoutes = require('./routes/orders');

// Mount routes – using a common /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/orders', orderRoutes);

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
            code: err.code,
            stack: err.stack ? 'present' : 'absent'
        });
    }
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Export app for Vercel
module.exports = app;

// Only listen if run directly (local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Backend rodando na porta ${PORT}`);
    });
}

