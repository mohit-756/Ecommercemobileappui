/**
 * Admin Audit Log Middleware
 * Logs all admin API actions to console (structured JSON) so they can be
 * captured by any log aggregator (Render/Railway log drain, Datadog, etc.).
 *
 * Logged fields: timestamp, adminId, adminEmail, method, path, statusCode,
 *                durationMs, ip, body (sanitised — no passwords/tokens).
 */

const SENSITIVE_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'otp']);

function sanitiseBody(body) {
  if (!body || typeof body !== 'object') return body;
  const cleaned = {};
  for (const [k, v] of Object.entries(body)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      cleaned[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      cleaned[k] = sanitiseBody(v);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

export function adminAuditLog(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const entry = {
      timestamp: new Date().toISOString(),
      adminId: req.user?._id || req.user?.id || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
        ? sanitiseBody(req.body)
        : undefined,
    };
    // Use a distinct prefix so it's easy to grep/filter
    console.log('[ADMIN_AUDIT]', JSON.stringify(entry));
  });

  next();
}
