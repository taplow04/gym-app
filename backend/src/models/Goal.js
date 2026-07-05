const mongoose = require("mongoose");
const { GOAL_TYPES } = require("../constants");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: GOAL_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    target: { type: Number, min: 0 }, // e.g. 75 (kg), 4 (workouts/week), 3000 (ml)
    current: { type: Number, min: 0, default: 0 },
    unit: { type: String, maxlength: 20, default: "" }, // kg, workouts, ml, kcal, g
    deadline: { type: Date },
    achieved: { type: Boolean, default: false },
    achievedAt: { type: Date },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, achieved: 1 });

goalSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Goal", goalSchema);
