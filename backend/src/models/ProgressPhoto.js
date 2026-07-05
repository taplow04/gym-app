const mongoose = require("mongoose");

const progressPhotoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now },
    url: { type: String, required: true },
    publicId: { type: String, required: true, select: false },
    pose: { type: String, enum: ["front", "back", "side", "other"], default: "front" },
    note: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

progressPhotoSchema.index({ user: 1, date: -1 });

progressPhotoSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.__v;
    delete ret.publicId;
    return ret;
  },
});

module.exports = mongoose.model("ProgressPhoto", progressPhotoSchema);
