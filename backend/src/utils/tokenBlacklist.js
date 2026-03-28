// Author: Sourav Kumar Das
// In-memory token blacklist. Tokens are added on logout and checked on each
// authenticated request. Entries are auto-expired after the token TTL (1 hour)
// to prevent unbounded memory growth.

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour — must match jwt expiresIn

const blacklist = new Map(); // token -> expiry timestamp

exports.add = (token) => {
  const expiry = Date.now() + TOKEN_TTL_MS;
  blacklist.set(token, expiry);
};

exports.has = (token) => {
  const expiry = blacklist.get(token);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

// Prune expired entries periodically to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of blacklist.entries()) {
    if (now > expiry) blacklist.delete(token);
  }
}, TOKEN_TTL_MS);
