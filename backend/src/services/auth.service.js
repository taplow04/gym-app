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
  const code = user.createEmailOtp(env.otp.ttlMinutes);
  await user.save();

  // Fire-and-forget: the response must never wait on the email provider.
  sendEmail(user.email, templates.verifyOtp(user.name, code, env.otp.ttlMinutes)).catch(
    (err) => console.error("verification email failed:", err.message)
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

const OTP_FIELDS =
  "+emailOtpHash +emailOtpExpires +emailOtpAttempts +emailOtpLastSentAt";

async function verifyEmailOtp(userId, code) {
  const user = await User.findById(userId).select(OTP_FIELDS);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (user.emailVerified) throw ApiError.badRequest("Email is already verified");

  if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < new Date()) {
    throw ApiError.badRequest("That code has expired — request a new one");
  }
  if (user.emailOtpAttempts >= env.otp.maxAttempts) {
    // Burned: this code can never succeed again, only a resend helps.
    user.clearEmailOtp();
    await user.save();
    throw ApiError.badRequest("Too many incorrect attempts — request a new code");
  }

  if (!user.checkEmailOtp(code)) {
    user.emailOtpAttempts += 1;
    await user.save();
    const left = env.otp.maxAttempts - user.emailOtpAttempts;
    throw ApiError.badRequest(
      left > 0
        ? `Incorrect code — ${left} attempt${left === 1 ? "" : "s"} left`
        : "Too many incorrect attempts — request a new code"
    );
  }

  user.emailVerified = true;
  user.clearEmailOtp();
  await user.save();
  return user;
}

async function resendVerificationOtp(authedUser) {
  if (authedUser.emailVerified) throw ApiError.badRequest("Email is already verified");

  const user = await User.findById(authedUser._id).select(OTP_FIELDS);
  const cooldownMs = env.otp.resendCooldownSec * 1000;
  if (user.emailOtpLastSentAt && Date.now() - user.emailOtpLastSentAt.getTime() < cooldownMs) {
    const wait = Math.ceil(
      (cooldownMs - (Date.now() - user.emailOtpLastSentAt.getTime())) / 1000
    );
    throw ApiError.tooMany(`Please wait ${wait}s before requesting another code`);
  }

  const code = user.createEmailOtp(env.otp.ttlMinutes); // invalidates the old code
  await user.save();
  sendEmail(user.email, templates.verifyOtp(user.name, code, env.otp.ttlMinutes)).catch(
    (err) => console.error("resend verification email failed:", err.message)
  );
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  // Always succeed outwardly — no user enumeration via this endpoint.
  if (!user) return;
  const raw = user.createOneTimeToken("passwordReset", 15);
  await user.save();
  const resetUrl = `${env.clientUrl}/#/reset-password/${raw}`;
  sendEmail(user.email, templates.resetPassword(user.name, resetUrl)).catch((err) =>
    console.error("password reset email failed:", err.message)
  );
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
  sendEmail(user.email, templates.passwordChanged(user.name)).catch(() => {});
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
  sendEmail(user.email, templates.passwordChanged(user.name)).catch(() => {});
  return user;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmailOtp,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  issueTokens,
};
