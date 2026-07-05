const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
}

/** rememberMe controls refresh lifetime: 30 days vs 1 day */
function signRefreshToken(user, rememberMe) {
  const days = rememberMe ? env.jwt.refreshDays : env.jwt.refreshDaysShort;
  // jti guarantees uniqueness — two tokens signed in the same second must
  // never be identical, or rotation/reuse-detection silently breaks.
  const token = jwt.sign(
    { sub: user._id.toString(), remember: Boolean(rememberMe), jti: crypto.randomUUID() },
    env.jwt.refreshSecret,
    { expiresIn: `${days}d` }
  );
  return { token, expiresAt: new Date(Date.now() + days * 24 * 3600 * 1000) };
}

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/** httpOnly cookie options for the refresh token */
function refreshCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax", // cross-site in prod (Pages ↔ API)
    path: "/api/auth",
    expires: expiresAt,
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshCookieOptions,
};
