const mongoose = require("mongoose");
const crypto = require("crypto");

// Server-side record of every issued refresh token (hashed). Enables
// rotation, revocation ("logout"), logout-everywhere, and reuse detection.

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

// Mongo auto-purges expired sessions.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.hash = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
