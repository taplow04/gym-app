const mongoose = require("mongoose");

// A weekly split (7 days, Monday-first — mirrors the frontend) or a
// reusable template. One plan per user may be active at a time.

const planExerciseSchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    targetSets: { type: Number, min: 1, max: 20, default: 3 },
    targetReps: { type: String, default: "8-12", maxlength: 20 }, // "8-12", "AMRAP", "5"
    restSec: { type: Number, min: 0, max: 600, default: 90 },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    focus: { type: String, trim: true, maxlength: 60, default: "Training Day" },
    rest: { type: Boolean, default: false },
    exercises: [planExerciseSchema],
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 300 },
    isActive: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false },
    days: {
      type: [daySchema],
      validate: {
        validator: (v) => v.length === 7,
        message: "A weekly plan must have exactly 7 days (Monday-first)",
      },
    },
  },
  { timestamps: true }
);

workoutPlanSchema.index({ user: 1, isActive: 1 });

workoutPlanSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
