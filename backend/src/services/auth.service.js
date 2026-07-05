const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const { sendEmail } = require("./email.service");
const templates = require("../emails/templates");

/** Issue an access+refresh pair and persist the refresh token hash. */
async function issueTokens(user, rememberMe, meta = {}) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, expiresAt } = signRefreshToken(user, rememberMe);
  await RefreshToken.create({
    user: user._id,
    tokenHash: RefreshToken.hash(refreshToken),
    expiresAt,
    userAgent: meta.userAgent || "",
    ip: meta.ip || "",
  });
  return { accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

async function register({ name, email, password }, meta) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("That email is already registered");

  const user = new User({ name, email, password });
  const rawVerify = user.createOneTimeToken("emailVerification", 24 * 60);
  await user.save();

  const verifyUrl = `${env.clientUrl}/#/verify-email/${rawVerify}`;
  await sendEmail(user.email, templates.verifyEmail(user.name, verifyUrl)).catch((err) =>
    console.error("verification email failed:", err.message)
  );

  const tokens = await issueTokens(user, true, meta);
  return { user, ...tokens };
}

async function login({ email, password, rememberMe }, meta) {
  const user = await User.findOne({ email }).select("+password");
  // Same error for unknown email and wrong password — no user enumeration.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  const tokens = await issueTokens(user, rememberMe, meta);
  return { user, ...tokens };
}

/** Rotation: every refresh consumes the old token and issues a new pair. */
async function refresh(rawToken, meta) {
  if (!rawToken) throw ApiError.unauthorized("Missing refresh token");

  const payload = verifyRefreshToken(rawToken); // throws on tamper/expiry

  const stored = await RefreshToken.findOneAndDelete({
    tokenHash: RefreshToken.hash(rawToken),
  });
  if (!stored) {
    // Valid signature but not in the store → already used or revoked.
    // Possible token theft: revoke the whole session family.
    await RefreshToken.deleteMany({ user: payload.sub });
    throw ApiError.unauthorized("Refresh token reuse detected — please log in again");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  const tokens = await issueTokens(user, payload.remember, meta);
  return { user, ...tokens };
}

async function logout(rawToken) {
  if (!rawToken) return;
  await RefreshToken.deleteOne({ tokenHash: RefreshToken.hash(rawToken) });
}

const logoutAll = (userId) => RefreshToken.deleteMany({ user: userId });

async function verifyEmail(rawToken) {
  const user = await User.findOne({
    emailVerificationToken: User.hashToken(rawToken),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw ApiError.badRequest("Verification link is invalid or has expired");

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return user;
}

async function resendVerification(user) {
  if (user.emailVerified) throw ApiError.badRequest("Email is already verified");
  const fresh = await User.findById(user._id);
  const raw = fresh.createOneTimeToken("emailVerification", 24 * 60);
  await fresh.save();
  const verifyUrl = `${env.clientUrl}/#/verify-email/${raw}`;
  await sendEmail(fresh.email, templates.verifyEmail(fresh.name, verifyUrl));
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  // Always succeed outwardly — no user enumeration via this endpoint.
  if (!user) return;
  const raw = user.createOneTimeToken("passwordReset", 15);
  await user.save();
  const resetUrl = `${env.clientUrl}/#/reset-password/${raw}`;
  await sendEmail(user.email, templates.resetPassword(user.name, resetUrl));
}

async function resetPassword(rawToken, newPassword) {
  const user = await User.findOne({
    passwordResetToken: User.hashToken(rawToken),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");
  if (!user) throw ApiError.badRequest("Reset link is invalid or has expired");

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await logoutAll(user._id); // every existing session dies with the old password
  await sendEmail(user.email, templates.passwordChanged(user.name)).catch(() => {});
  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  await logoutAll(user._id);
  await sendEmail(user.email, templates.passwordChanged(user.name)).catch(() => {});
  return user;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  issueTokens,
};
