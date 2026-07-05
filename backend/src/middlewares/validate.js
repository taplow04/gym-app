const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs an array of express-validator chains, then converts any failures
// into a single 400 with per-field messages. Usage:
//   router.post("/", validate(registerRules), controller.register)

function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();
      const errors = result.array({ onlyFirstError: true }).map((e) => ({
        field: e.path,
        message: e.msg,
      }));
      next(ApiError.badRequest("Validation failed", errors));
    },
  ];
}

module.exports = validate;
