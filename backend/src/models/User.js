const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  ROLES,
  GENDERS,
  FITNESS_GOALS,
  ACTIVITY_LEVELS,
  EXPERIENCE_LEVELS,
  UNITS,
  THEMES,
} = require("../constants");

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never leaves the DB unless explicitly asked for
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },

    // ── Profile ──
    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "", select: false },
    },
    gender: { type: String, enum: GENDERS },
    dateOfBirth: { type: Date },
    heightCm: { type: Number, min: 50, max: 300 },
    weightKg: { type: Number, min: 20, max: 500 },
    targetWeightKg: { type: Number, min: 20, max: 500 },
    fitnessGoal: { type: String, enum: FITNESS_GOALS },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 120 },

    // ── Preferences / settings ──
    preferences: {
      units: { type: String, enum: UNITS, default: "kg" },
      theme: { type: String, enum: THEMES, default: "dark" },
      language: { type: String, default: "en", maxlength: 8 },
      restSec: { type: Number, default: 90, min: 15, max: 600 },
      notifications: {
        workoutReminders: { type: Boolean, default: true },
        prAlerts: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
      privacy: {
        shareStats: { type: Boolean, default: false }, // future: coach sharing
      },
    },

    // ── Auth state ──
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// Virtual age from dateOfBirth — derived, never stored.
userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return undefined;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
});

// ── Hash on change ──
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** True if the password changed after the given JWT iat (seconds) */
userSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  return this.passwordChangedAt.getTime() / 1000 > jwtIat;
};

/** Generate a one-time token; store only its sha256 hash. Returns the raw token. */
userSchema.methods.createOneTimeToken = function (field, ttlMinutes) {
  const raw = crypto.randomBytes(32).toString("hex");
  this[`${field}Token`] = crypto.createHash("sha256").update(raw).digest("hex");
  this[`${field}Expires`] = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return raw;
};

userSchema.statics.hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// Strip anything sensitive from every serialized user, everywhere.
userSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.passwordChangedAt;
    delete ret.__v;
    delete ret.id;
    if (ret.profilePicture) delete ret.profilePicture.publicId;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
