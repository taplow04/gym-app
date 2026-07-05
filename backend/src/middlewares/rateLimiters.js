const rateLimit = require("express-rate-limit");

// Global: generous — protects against floods without hurting real use.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

// Auth: strict — the credential-stuffing surface.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many attempts, please try again in 15 minutes" },
});

// Password-reset / verification email sending: prevent mailbox bombing.
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many email requests, please try again later" },
});

module.exports = { globalLimiter, authLimiter, emailLimiter };
