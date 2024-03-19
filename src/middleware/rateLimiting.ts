import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Rate limiting middleware.
 */
export const limiter = (): RateLimitRequestHandler => {
  const limiter = rateLimit({
    windowMs: 16 * 1000, // 16 seconds
    limit: 10, // Limit each IP to 10 requests per `window` (here, per 16 seconds).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
  });
  return limiter;
};
