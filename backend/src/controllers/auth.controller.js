const authService = require("../services/auth.service");
const { refreshCookieOptions } = require("../utils/tokens");

const REFRESH_COOKIE = "refreshToken";

const meta = (req) => ({ userAgent: req.get("user-agent"), ip: req.ip });

function sendAuth(res, status, { user, accessToken, refreshToken, refreshExpiresAt }) {
  res
    .cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(refreshExpiresAt))
    .status(status)
    .json({ success: true, data: { user, accessToken } });
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password }, meta(req));
  sendAuth(res, 201, result);
};

exports.login = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;
  const result = await authService.login({ email, password, rememberMe }, meta(req));
  sendAuth(res, 200, result);
};

exports.refresh = async (req, res) => {
  const result = await authService.refresh(req.cookies[REFRESH_COOKIE], meta(req));
  sendAuth(res, 200, result);
};

exports.logout = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  res
    .clearCookie(REFRESH_COOKIE, { path: "/api/auth" })
    .json({ success: true, message: "Logged out" });
};

exports.logoutAll = async (req, res) => {
  await authService.logoutAll(req.user._id);
  res
    .clearCookie(REFRESH_COOKIE, { path: "/api/auth" })
    .json({ success: true, message: "Logged out on all devices" });
};

exports.verifyEmail = async (req, res) => {
  await authService.verifyEmail(req.params.token);
  res.json({ success: true, message: "Email verified" });
};

exports.resendVerification = async (req, res) => {
  await authService.resendVerification(req.user);
  res.json({ success: true, message: "Verification email sent" });
};

exports.forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({
    success: true,
    message: "If that email is registered, a reset link has been sent",
  });
};

exports.resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  res.json({ success: true, message: "Password reset — please log in" });
};

exports.changePassword = async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res
    .clearCookie(REFRESH_COOKIE, { path: "/api/auth" })
    .json({ success: true, message: "Password changed — please log in again" });
};
