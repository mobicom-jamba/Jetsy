
// server/middleware/rateLimiter.js
const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

const rateLimiters = {
  auth: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 5,
    duration: 900,
    blockDuration: 900,
  }),
  
  api: new RateLimiterMemory({
    keyGenerator: (req) => req.user?.id || req.ip,
    points: 100,
    duration: 3600,
    blockDuration: 3600,
  }),

  metaApi: new RateLimiterMemory({
    keyGenerator: (req) => req.user?.id || req.ip,
    points: 200,
    duration: 3600,
    blockDuration: 300,
  })
};

const createRateLimitMiddleware = (limiterName) => {
  return async (req, res, next) => {
    const limiter = rateLimiters[limiterName];
    
    if (!limiter) {
      return next();
    }

    try {
      await limiter.consume(req.user?.id || req.ip);
      next();
    } catch (rejRes) {
      const msBeforeNext = rejRes.msBeforeNext || 1;
      
      logger.warn(`Rate limit exceeded for ${limiterName}`, {
        user: req.user?.id,
        ip: req.ip,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext
      });

      res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.round(msBeforeNext / 1000)} seconds.`,
        retryAfter: Math.round(msBeforeNext / 1000)
      });
    }
  };
};

module.exports = {
  authLimiter: createRateLimitMiddleware('auth'),
  apiLimiter: createRateLimitMiddleware('api'),
  metaApiLimiter: createRateLimitMiddleware('metaApi')
};
