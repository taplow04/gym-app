const Measurement = require("../models/Measurement");
const ProgressPhoto = require("../models/ProgressPhoto");
const PersonalRecord = require("../models/PersonalRecord");
const statsService = require("../services/stats.service");
const { uploadImage, deleteImage } = require("../services/upload.service");
const ApiError = require("../utils/ApiError");

const dayStart = (d) => {
  const date = d ? new Date(d) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// ── Measurements ──
exports.listMeasurements = async (req, res) => {
  const { from, to } = req.query;
  const filter = { user: req.user._id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const measurements = await Measurement.find(filter).sort("-date").limit(365);
  res.json({ success: true, data: { measurements } });
};

/** Upsert on (user, day) — logging twice in a day updates the check-in. */
exports.upsertMeasurement = async (req, res) => {
  const date = dayStart(req.body.date);
  const update = { note: req.body.note };
  if (req.body.weightKg !== undefined) update.weightKg = req.body.weightKg;
  if (req.body.bodyFatPct !== undefined) update.bodyFatPct = req.body.bodyFatPct;
  for (const [key, value] of Object.entries(req.body.measurements || {})) {
    update[`measurements.${key}`] = value;
  }

  const measurement = await Measurement.findOneAndUpdate(
    { user: req.user._id, date },
    { $set: update },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Convenience: latest body weight mirrors onto the profile
  if (req.body.weightKg !== undefined) {
    req.user.weightKg = req.body.weightKg;
    await req.user.save();
  }

  res.json({ success: true, data: { measurement } });
};

exports.deleteMeasurement = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Measurement deleted" });
};

// ── Progress photos ──
exports.listPhotos = async (req, res) => {
  const photos = await ProgressPhoto.find({ user: req.user._id }).sort("-date").limit(200);
  res.json({ success: true, data: { photos } });
};

exports.uploadPhoto = async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image file provided (field: image)");
  const uploaded = await uploadImage(req.file.buffer, "progress");
  const photo = await ProgressPhoto.create({
    user: req.user._id,
    url: uploaded.url,
    publicId: uploaded.publicId,
    pose: req.body.pose,
    note: req.body.note,
    date: req.body.date || new Date(),
  });
  res.status(201).json({ success: true, data: { photo } });
};

exports.deletePhoto = async (req, res) => {
  const photo = await ProgressPhoto.findById(req.doc._id).select("+publicId");
  await photo.deleteOne();
  await deleteImage(photo.publicId);
  res.json({ success: true, message: "Photo deleted" });
};

// ── Personal records ──
exports.listRecords = async (req, res) => {
  const records = await PersonalRecord.find({ user: req.user._id }).sort(
    "-bestEst1RM.valueKg"
  );
  res.json({ success: true, data: { records } });
};

exports.deleteRecord = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Record deleted" });
};

// ── Stats ──
exports.overview = async (req, res) => {
  const stats = await statsService.overview(req.user._id);
  res.json({ success: true, data: { stats } });
};

exports.weekly = async (req, res) => {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 3600 * 1000);
  const buckets = await statsService.summary(req.user._id, from, to, "day");
  res.json({ success: true, data: { from, to, buckets } });
};

exports.monthly = async (req, res) => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 3600 * 1000);
  const buckets = await statsService.summary(req.user._id, from, to, "week");
  res.json({ success: true, data: { from, to, buckets } });
};

exports.exerciseProgress = async (req, res) => {
  const points = await statsService.exerciseProgress(
    req.user._id,
    req.query.exercise,
    req.query.limit || 50
  );
  res.json({ success: true, data: { exercise: req.query.exercise, points } });
};

exports.weightHistory = async (req, res) => {
  const history = await statsService.weightHistory(req.user._id);
  res.json({ success: true, data: { history } });
};
