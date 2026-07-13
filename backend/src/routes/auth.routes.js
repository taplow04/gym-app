const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const rules = require("../validators/auth.validators");
const requireAuth = require("../middlewares/auth");
const { authLimiter, emailLimiter } = require("../middlewares/rateLimiters");

router.post("/register", authLimiter, validate(rules.register), controller.register);
router.post("/login", authLimiter, validate(rules.login), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", requireAuth, controller.logoutAll);

router.post("/verify-otp", requireAuth, authLimiter, validate(rules.verifyOtp), controller.verifyOtp);
router.post("/resend-otp", requireAuth, emailLimiter, controller.resendOtp);

router.post("/forgot-password", emailLimiter, validate(rules.forgotPassword), controller.forgotPassword);
router.post("/reset-password/:token", authLimiter, validate(rules.resetPassword), controller.resetPassword);
router.post("/change-password", requireAuth, validate(rules.changePassword), controller.changePassword);

module.exports = router;
