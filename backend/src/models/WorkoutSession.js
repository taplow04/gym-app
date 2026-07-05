const mongoose = require("mongoose");
const { SET_TYPES, SESSION_STATUS } = require("../constants");

// A training session: created "active", logged set-by-set, then
// completed — at which point totals are frozen and PRs evaluated.
// Entries snapshot exercise name/muscle so history never breaks if a
// library exercise is renamed or deleted.

const setSchema = new mongoose.Schema(
  {
    type: { type: String, enum: SET_TYPES, default: "normal" },
    weightKg: { type: Number, min: 0, max: 1000, default: 0 },
    reps: { type: Number, min: 0, max: 1000, default: 0 },
    durationSec: { type: Number, min: 0, max: 86400 }, // timed sets (plank, cardio)
    restSec: { type: Number, min: 0, max: 3600 },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const entrySchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    muscle: { type: String, default: "" },
    notes: { type: String, maxlength: 500 },
    supersetGroup: { type: Number, min: 1, max: 50, default: null }, // same number = superset
    sets: [setSchema],
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan", default: null },
    title: { type: String, trim: true, maxlength: 80, default: "Workout" },
    notes: { type: String, maxlength: 1000 },
    status: { type: String, enum: SESSION_STATUS, default: "active" },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    // Frozen at completion:
    durationSec: { type: Number, min: 0 },
    totalVolumeKg: { type: Number, min: 0 },
    totalSets: { type: Number, min: 0 },
    entries: [entrySchema],
  },
  { timestamps: true }
);

workoutSessionSchema.index({ user: 1, startedAt: -1 });
workoutSessionSchema.index({ user: 1, status: 1 });

/** Volume/sets across completed working sets (warm-ups excluded). */
workoutSessionSchema.methods.computeTotals = function () {
  let volume = 0;
  let sets = 0;
  for (const entry of this.entries) {
    for (const set of entry.sets) {
      if (!set.done || set.type === "warmup") continue;
      volume += (set.weightKg || 0) * (set.reps || 0);
      sets += 1;
    }
  }
  return { totalVolumeKg: Math.round(volume), totalSets: sets };
};

workoutSessionSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
