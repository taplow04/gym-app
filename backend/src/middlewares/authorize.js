const ApiError = require("../utils/ApiError");

// Role-based access control. Usage: router.get("/", requireAuth,
// authorize("admin"), handler) — or authorize("admin", "coach").

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}

module.exports = authorize;
