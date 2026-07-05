const { body, param } = require("express-validator");

const email = body("email")
  .trim()
  .isEmail()
  .withMessage("A valid email is required")
  .normalizeEmail();

const strongPassword = (field) =>
  body(field)
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8–128 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter");

const tokenParam = param("token")
  .isHexadecimal()
  .isLength({ min: 64, max: 64 })
  .withMessage("Invalid token");

exports.register = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  email,
  strongPassword("password"),
];

exports.login = [
  email,
  body("password").notEmpty().withMessage("Password is required"),
  body("rememberMe").optional().isBoolean().toBoolean(),
];

exports.forgotPassword = [email];

exports.resetPassword = [tokenParam, strongPassword("password")];

exports.changePassword = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  strongPassword("newPassword").custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error("New password must be different from the current one");
    }
    return true;
  }),
];

exports.verifyEmail = [tokenParam];
