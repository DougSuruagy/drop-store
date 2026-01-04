// src/middleware/rateLimiter.js
const rateLimits = new Map();

/**
 * Simple In-Memory Rate Limiter to prevent brute force and spam.
 * PERFORMANCE: Extremely lightweight, no external DB needed for basic protection.
 */
function rateLimiter(limit = 10, windowMs = 60 * 1000) {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const now = Date.now();

        if (!rateLimits.has(ip)) {
            rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const data = rateLimits.get(ip);

        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
            return next();
        }

        data.count++;
        if (data.count > limit) {
            console.warn(`🛡️ [RateLimit] Bloqueado: ${ip} excedeu limite de ${limit} requisições.`);
            return res.status(429).json({
                error: 'Muitas requisições. Por favor, aguarde um minuto e tente novamente.'
            });
        }

        next();
    };
}

module.exports = rateLimiter;
