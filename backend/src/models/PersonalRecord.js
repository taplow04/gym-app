const mongoose = require("mongoose");

// One document per user × exercise, tracking their four bests. Updated
// automatically on session completion; readable/deletable via API.

const bestSchema = (fields) => ({ ...fields, date: Date, session: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutSession" } });

const personalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", default: null },
    exerciseName: { type: String, required: true, trim: true, maxlength: 100 },

    bestWeight: bestSchema({ weightKg: Number, reps: Number }), // heaviest successful set
    bestEst1RM: bestSchema({ valueKg: Number, weightKg: Number, reps: Number }), // Epley
    bestVolume: bestSchema({ volumeKg: Number }), // most single-session volume
    bestReps: bestSchema({ reps: Number, weightKg: Number }), // most reps in one set
  },
  { timestamps: true }
);

personalRecordSchema.index({ user: 1, exerciseName: 1 }, { unique: true });

personalRecordSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("PersonalRecord", personalRecordSchema);
