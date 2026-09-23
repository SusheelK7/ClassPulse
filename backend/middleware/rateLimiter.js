const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: { message: 'Too many attempts, try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter, verifyLimiter };