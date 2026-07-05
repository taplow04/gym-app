require("express-async-errors"); // async handlers throw straight to error middleware
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const env = require("./config/env");
const routes = require("./routes");
const { globalLimiter } = require("./middlewares/rateLimiters");
const { notFound, errorHandler } = require("./middlewares/error");

const app = express();

// Behind a reverse proxy (Render/Railway/Heroku) the client IP arrives
// via X-Forwarded-For — required for rate limiting to key correctly.
app.set("trust proxy", 1);

// ── Security ────────────────────────────────────────────
app.use(helmet());
// CLIENT_URL may include the SPA base path (e.g. …:5173/gym-app) for
// email links — CORS must compare against the bare origin.
app.use(
  cors({
    origin: new URL(env.clientUrl).origin,
    credentials: true, // refresh-token cookie
  })
);
app.use(globalLimiter);

// ── Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ── Sanitization (after parsing, before routes) ─────────
app.use(mongoSanitize()); // strips $ and . keys → NoSQL-injection guard
app.use(xss()); // sanitizes user input in body/query/params
app.use(hpp()); // HTTP parameter pollution

// ── Misc ────────────────────────────────────────────────
app.use(compression());
if (!env.isProd) app.use(morgan("dev"));

// ── Routes ──────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "Forge API is running", uptime: process.uptime() })
);
app.use("/api", routes);

// ── Errors ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
