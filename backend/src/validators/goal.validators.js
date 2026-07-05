const { body } = require("express-validator");
const { GOAL_TYPES, REMINDER_TYPES } = require("../constants");

exports.createGoal = [
  body("type").isIn(GOAL_TYPES).withMessage("Invalid goal type"),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
  body("target").optional().isFloat({ min: 0 }).toFloat(),
  body("current").optional().isFloat({ min: 0 }).toFloat(),
  body("unit").optional().trim().isLength({ max: 20 }),
  body("deadline").optional().isISO8601().toDate(),
];

exports.updateGoal = [
  body("title").optional().trim().notEmpty().isLength({ max: 120 }),
  body("target").optional().isFloat({ min: 0 }).toFloat(),
  body("current").optional().isFloat({ min: 0 }).toFloat(),
  body("unit").optional().trim().isLength({ max: 20 }),
  body("deadline").optional({ values: "null" }).isISO8601().toDate(),
  body("achieved").optional().isBoolean().toBoolean(),
];

exports.createReminder = [
  body("type").isIn(REMINDER_TYPES).withMessage("Invalid reminder type"),
  body("time").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("time must be HH:mm (24h)"),
  body("days").isArray({ min: 1, max: 7 }).withMessage("Pick at least one day"),
  body("days.*").isInt({ min: 0, max: 6 }).toInt(),
  body("message").optional().trim().isLength({ max: 200 }),
  body("enabled").optional().isBoolean().toBoolean(),
];

exports.updateReminder = [
  body("type").optional().isIn(REMINDER_TYPES),
  body("time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("days").optional().isArray({ min: 1, max: 7 }),
  body("days.*").isInt({ min: 0, max: 6 }).toInt(),
  body("message").optional().trim().isLength({ max: 200 }),
  body("enabled").optional().isBoolean().toBoolean(),
];
