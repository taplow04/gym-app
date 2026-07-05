const env = require("../config/env");
const ApiError = require("../utils/ApiError");

// 404 for unmatched routes — keep after all routers.
function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Translate known library errors into operational ApiErrors */
function normalize(err) {
  if (err instanceof ApiError) return err;

  // Mongoose: invalid ObjectId in a path we didn't validate
  if (err.name === "CastError") {
    return ApiError.badRequest(`Invalid value for "${err.path}"`);
  }
  // Mongoose schema validation
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest("Validation failed", details);
  }
  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return ApiError.conflict(`That ${field} is already in use`);
  }
  // JWT
  if (err.name === "JsonWebTokenError") return ApiError.unauthorized("Invalid token");
  if (err.name === "TokenExpiredError") return ApiError.unauthorized("Token expired");
  // Multer
  if (err.name === "MulterError") {
    const msg =
      err.code === "LIMIT_FILE_SIZE" ? "Image too large (max 5 MB)" : err.message;
    return ApiError.badRequest(msg);
  }
  return err;
}

// Centralized error handler — every error in the app funnels here and
// leaves as consistent JSON. Programmer errors never leak internals in prod.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const error = normalize(err);
  const isOperational = error.isOperational === true;
  const statusCode = isOperational ? error.statusCode : 500;

  if (!isOperational) {
    console.error("💥 Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational
      ? error.message
      : env.isProd
        ? "Something went wrong"
        : error.message,
    ...(error.details ? { errors: error.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
