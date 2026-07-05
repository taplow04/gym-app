const mongoose = require("mongoose");
const {
  MUSCLES,
  EQUIPMENT,
  DIFFICULTY,
  EXERCISE_CATEGORIES,
} = require("../constants");

// Global library entries have user = null (admin-managed, seeded).
// User-created custom exercises carry their owner and are private.

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, trim: true, lowercase: true },
    primaryMuscle: { type: String, enum: MUSCLES, required: true },
    secondaryMuscles: [{ type: String, enum: MUSCLES }],
    equipment: { type: String, enum: EQUIPMENT, default: "Other" },
    difficulty: { type: String, enum: DIFFICULTY, default: "beginner" },
    category: { type: String, enum: EXERCISE_CATEGORIES, default: "strength" },
    instructions: [{ type: String, maxlength: 500 }],
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: "text" });
exerciseSchema.index({ user: 1, name: 1 }, { unique: true }); // no dup names per owner
exerciseSchema.index({ primaryMuscle: 1 });

exerciseSchema.virtual("isCustom").get(function () {
  return this.user != null;
});

exerciseSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
