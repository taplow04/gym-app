const mongoose = require("mongoose");

// One check-in per user per day: body weight, body-fat %, and tape
// measurements (cm). Sparse — only what the user logged that day.

const measurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    weightKg: { type: Number, min: 20, max: 500 },
    bodyFatPct: { type: Number, min: 1, max: 75 },
    measurements: {
      neck: { type: Number, min: 10, max: 100 },
      chest: { type: Number, min: 30, max: 250 },
      waist: { type: Number, min: 30, max: 250 },
      hips: { type: Number, min: 30, max: 250 },
      leftBicep: { type: Number, min: 10, max: 100 },
      rightBicep: { type: Number, min: 10, max: 100 },
      leftThigh: { type: Number, min: 20, max: 150 },
      rightThigh: { type: Number, min: 20, max: 150 },
      leftCalf: { type: Number, min: 10, max: 100 },
      rightCalf: { type: Number, min: 10, max: 100 },
    },
    note: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

// One entry per user per calendar day — the API upserts onto this.
measurementSchema.index({ user: 1, date: 1 }, { unique: true });

measurementSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Measurement", measurementSchema);
