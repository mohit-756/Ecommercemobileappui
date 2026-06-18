import rateLimit from 'express-rate-limit';

const ipMap = new Map();

/**
 * OTP-specific in-memory rate limiter.
 * Allows maximum 5 OTP requests per 10 minutes per IP.
 */
export function otpRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const limitWindow = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  if (!ipMap.has(ip)) {
    ipMap.set(ip, []);
  }

  const requests = ipMap.get(ip).filter(timestamp => now - timestamp < limitWindow);
  requests.push(now);
  ipMap.set(ip, requests);

  if (requests.length > maxRequests) {
    return res.status(429).json({
      message: 'Too many OTP requests. Please try again after 10 minutes.',
    });
  }

  next();
}

/**
 * General API rate limiter — 120 requests per minute per IP.
 * Protects all API endpoints from abuse.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down and try again in a minute.' },
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  },
});
