const { body, param, query } = require("express-validator");
const {
  GENDERS,
  FITNESS_GOALS,
  ACTIVITY_LEVELS,
  EXPERIENCE_LEVELS,
  UNITS,
  THEMES,
} = require("../constants");

exports.mongoId = (name = "id") => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
];

exports.pagination = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

exports.updateMe = [
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("gender").optional().isIn(GENDERS),
  body("dateOfBirth").optional().isISO8601().toDate(),
  body("heightCm").optional().isFloat({ min: 50, max: 300 }).toFloat(),
  body("weightKg").optional().isFloat({ min: 20, max: 500 }).toFloat(),
  body("targetWeightKg").optional().isFloat({ min: 20, max: 500 }).toFloat(),
  body("fitnessGoal").optional().isIn(FITNESS_GOALS),
  body("activityLevel").optional().isIn(ACTIVITY_LEVELS),
  body("experienceLevel").optional().isIn(EXPERIENCE_LEVELS),
  body("bio").optional().trim().isLength({ max: 500 }),
  body("location").optional().trim().isLength({ max: 120 }),
  // Fields that must never arrive through this endpoint:
  body("email").not().exists().withMessage("Email cannot be changed here"),
  body("password").not().exists().withMessage("Use /auth/change-password"),
  body("role").not().exists().withMessage("Role cannot be self-assigned"),
  body("emailVerified").not().exists(),
];

exports.updatePreferences = [
  body("units").optional().isIn(UNITS),
  body("theme").optional().isIn(THEMES),
  body("language").optional().isString().isLength({ max: 8 }),
  body("restSec").optional().isInt({ min: 15, max: 600 }).toInt(),
  body("notifications.workoutReminders").optional().isBoolean().toBoolean(),
  body("notifications.prAlerts").optional().isBoolean().toBoolean(),
  body("notifications.email").optional().isBoolean().toBoolean(),
  body("privacy.shareStats").optional().isBoolean().toBoolean(),
];
