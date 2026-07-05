const { body, query } = require("express-validator");

const TAPE_FIELDS = [
  "neck", "chest", "waist", "hips",
  "leftBicep", "rightBicep", "leftThigh", "rightThigh", "leftCalf", "rightCalf",
];

exports.upsertMeasurement = [
  body("date").optional().isISO8601().toDate(),
  body("weightKg").optional().isFloat({ min: 20, max: 500 }).toFloat(),
  body("bodyFatPct").optional().isFloat({ min: 1, max: 75 }).toFloat(),
  ...TAPE_FIELDS.map((f) =>
    body(`measurements.${f}`).optional().isFloat({ min: 10, max: 250 }).toFloat()
  ),
  body("note").optional().trim().isLength({ max: 300 }),
  body().custom((value) => {
    const hasAny =
      value.weightKg !== undefined ||
      value.bodyFatPct !== undefined ||
      (value.measurements && Object.keys(value.measurements).length > 0);
    if (!hasAny) throw new Error("Log at least one measurement");
    return true;
  }),
];

exports.dateRange = [
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
];

exports.uploadPhoto = [
  body("pose").optional().isIn(["front", "back", "side", "other"]),
  body("note").optional().trim().isLength({ max: 300 }),
  body("date").optional().isISO8601().toDate(),
];

exports.exerciseProgress = [
  query("exercise").trim().notEmpty().withMessage("exercise query param is required").isLength({ max: 100 }),
  query("limit").optional().isInt({ min: 1, max: 200 }).toInt(),
];
