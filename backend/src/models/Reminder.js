const mongoose = require("mongoose");
const { REMINDER_TYPES } = require("../constants");

// Local-time reminders: "HH:mm" + Monday-first weekday indexes. The
// reminder job materializes due ones into notifications.

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: REMINDER_TYPES, required: true },
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "time must be HH:mm (24h)"],
    },
    days: {
      type: [{ type: Number, min: 0, max: 6 }], // 0 = Monday … 6 = Sunday
      validate: { validator: (v) => v.length > 0, message: "Pick at least one day" },
    },
    message: { type: String, maxlength: 200 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reminderSchema.index({ enabled: 1, time: 1 });

reminderSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Reminder", reminderSchema);
