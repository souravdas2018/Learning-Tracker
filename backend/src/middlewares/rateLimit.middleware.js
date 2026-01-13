// Basic rate limiting middleware using express-rate-limit
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { rateLimiter };
