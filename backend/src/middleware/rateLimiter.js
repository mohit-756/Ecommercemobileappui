const ipMap = new Map();

/**
 * Simple in-memory rate limiter to prevent spamming OTP requests.
 * Allows maximum 5 OTP requests per 10 minutes per IP.
 */
export function otpRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const limitWindow = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5; // max 5 requests

  if (!ipMap.has(ip)) {
    ipMap.set(ip, []);
  }

  // Filter out requests older than the limit window
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
