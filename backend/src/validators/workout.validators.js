const { body, query } = require("express-validator");
const {
  MUSCLES,
  EQUIPMENT,
  DIFFICULTY,
  EXERCISE_CATEGORIES,
  SET_TYPES,
} = require("../constants");

// ── Exercises ──
exports.createExercise = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("primaryMuscle").isIn(MUSCLES).withMessage("Invalid muscle group"),
  body("secondaryMuscles").optional().isArray({ max: 5 }),
  body("secondaryMuscles.*").isIn(MUSCLES),
  body("equipment").optional().isIn(EQUIPMENT),
  body("difficulty").optional().isIn(DIFFICULTY),
  body("category").optional().isIn(EXERCISE_CATEGORIES),
  body("instructions").optional().isArray({ max: 15 }),
  body("instructions.*").isString().isLength({ max: 500 }),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  body("videoUrl").optional().isURL().withMessage("videoUrl must be a valid URL"),
];

exports.updateExercise = [
  body("name").optional().trim().notEmpty().isLength({ max: 100 }),
  body("primaryMuscle").optional().isIn(MUSCLES),
  body("secondaryMuscles").optional().isArray({ max: 5 }),
  body("secondaryMuscles.*").isIn(MUSCLES),
  body("equipment").optional().isIn(EQUIPMENT),
  body("difficulty").optional().isIn(DIFFICULTY),
  body("category").optional().isIn(EXERCISE_CATEGORIES),
  body("instructions").optional().isArray({ max: 15 }),
  body("instructions.*").isString().isLength({ max: 500 }),
  body("imageUrl").optional().isURL(),
  body("videoUrl").optional().isURL(),
];

exports.listExercises = [
  query("muscle").optional().isIn(MUSCLES),
  query("equipment").optional().isIn(EQUIPMENT),
  query("difficulty").optional().isIn(DIFFICULTY),
  query("category").optional().isIn(EXERCISE_CATEGORIES),
  query("search").optional().trim().isLength({ max: 100 }),
];

// ── Plans ──
const daysRules = [
  body("days").isArray({ min: 7, max: 7 }).withMessage("days must have exactly 7 entries (Monday-first)"),
  body("days.*.focus").optional().trim().isLength({ max: 60 }),
  body("days.*.rest").optional().isBoolean().toBoolean(),
  body("days.*.exercises").optional().isArray({ max: 20 }),
  body("days.*.exercises.*.exercise").isMongoId().withMessage("Invalid exercise id in plan"),
  body("days.*.exercises.*.targetSets").optional().isInt({ min: 1, max: 20 }).toInt(),
  body("days.*.exercises.*.targetReps").optional().isString().isLength({ max: 20 }),
  body("days.*.exercises.*.restSec").optional().isInt({ min: 0, max: 600 }).toInt(),
];

exports.createPlan = [
  body("name").trim().notEmpty().withMessage("Plan name is required").isLength({ max: 80 }),
  body("description").optional().trim().isLength({ max: 300 }),
  body("isTemplate").optional().isBoolean().toBoolean(),
  ...daysRules,
];

exports.updatePlan = [
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("description").optional().trim().isLength({ max: 300 }),
  body("days").optional().isArray({ min: 7, max: 7 }),
  body("days.*.focus").optional().trim().isLength({ max: 60 }),
  body("days.*.rest").optional().isBoolean().toBoolean(),
  body("days.*.exercises").optional().isArray({ max: 20 }),
  body("days.*.exercises.*.exercise").optional().isMongoId(),
  body("days.*.exercises.*.targetSets").optional().isInt({ min: 1, max: 20 }).toInt(),
  body("days.*.exercises.*.targetReps").optional().isString().isLength({ max: 20 }),
  body("days.*.exercises.*.restSec").optional().isInt({ min: 0, max: 600 }).toInt(),
];

// ── Sessions ──
const entriesRules = (prefix) => [
  body(`${prefix}`).isArray({ max: 30 }),
  body(`${prefix}.*.exercise`).optional({ values: "null" }).isMongoId(),
  body(`${prefix}.*.name`).trim().notEmpty().withMessage("Entry name is required").isLength({ max: 100 }),
  body(`${prefix}.*.muscle`).optional().isString().isLength({ max: 40 }),
  body(`${prefix}.*.notes`).optional().trim().isLength({ max: 500 }),
  body(`${prefix}.*.supersetGroup`).optional({ values: "null" }).isInt({ min: 1, max: 50 }).toInt(),
  body(`${prefix}.*.sets`).isArray({ min: 1, max: 30 }).withMessage("Each entry needs at least one set"),
  body(`${prefix}.*.sets.*.type`).optional().isIn(SET_TYPES),
  body(`${prefix}.*.sets.*.weightKg`).optional().isFloat({ min: 0, max: 1000 }).toFloat(),
  body(`${prefix}.*.sets.*.reps`).optional().isInt({ min: 0, max: 1000 }).toInt(),
  body(`${prefix}.*.sets.*.durationSec`).optional().isInt({ min: 0, max: 86400 }).toInt(),
  body(`${prefix}.*.sets.*.restSec`).optional().isInt({ min: 0, max: 3600 }).toInt(),
  body(`${prefix}.*.sets.*.done`).optional().isBoolean().toBoolean(),
];

exports.createSession = [
  body("title").optional().trim().isLength({ max: 80 }),
  body("plan").optional({ values: "null" }).isMongoId(),
  body("dayIndex").optional().isInt({ min: 0, max: 6 }).toInt(),
  body("entries").optional().isArray({ max: 30 }),
  // Wildcard sub-rules only run when entries is present:
  ...entriesRules("entries").slice(1),
];

exports.updateSession = [
  body("title").optional().trim().isLength({ max: 80 }),
  body("notes").optional().trim().isLength({ max: 1000 }),
  body("entries").optional().isArray({ max: 30 }),
  ...entriesRules("entries").slice(1),
];

exports.listSessions = [
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("status").optional().isIn(["active", "completed"]),
];
