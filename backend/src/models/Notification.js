const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../constants");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, maxlength: 500, default: "" },
    meta: { type: Object, default: {} },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
// Auto-expire read notifications after 60 days
notificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 60 * 24 * 3600, partialFilterExpression: { read: true } }
);

notificationSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
