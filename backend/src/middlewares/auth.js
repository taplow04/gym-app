const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/tokens");
const User = require("../models/User");

// Verifies the Bearer access token, loads the user, and rejects tokens
// issued before the last password change (stolen-token mitigation).

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized("Missing access token");

  const payload = verifyAccessToken(token); // throws → 401 via error middleware

  const user = await User.findById(payload.sub).select("+passwordChangedAt");
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (user.changedPasswordAfter(payload.iat)) {
    throw ApiError.unauthorized("Password was changed — please log in again");
  }

  req.user = user;
  next();
}

module.exports = requireAuth;
