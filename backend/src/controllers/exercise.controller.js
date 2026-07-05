const Exercise = require("../models/Exercise");
const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants");

// Library = global entries (user: null) + the requester's custom ones.

exports.list = async (req, res) => {
  const { muscle, equipment, difficulty, category, search } = req.query;
  const filter = {
    $or: [{ user: null }, { user: req.user._id }],
    ...(muscle && { primaryMuscle: muscle }),
    ...(equipment && { equipment }),
    ...(difficulty && { difficulty }),
    ...(category && { category }),
    ...(search && { name: { $regex: search, $options: "i" } }),
  };
  const exercises = await Exercise.find(filter).sort("name").limit(500);
  res.json({ success: true, data: { exercises, count: exercises.length } });
};

exports.get = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) throw ApiError.notFound("Exercise not found");
  const visible =
    exercise.user == null ||
    exercise.user.toString() === req.user._id.toString() ||
    req.user.role === ROLES.ADMIN;
  if (!visible) throw ApiError.forbidden();
  res.json({ success: true, data: { exercise } });
};

/** Users create private custom exercises; admins create global ones. */
exports.create = async (req, res) => {
  const global = req.user.role === ROLES.ADMIN && req.body.global === true;
  const exercise = await Exercise.create({
    ...pickExerciseFields(req.body),
    user: global ? null : req.user._id,
  });
  res.status(201).json({ success: true, data: { exercise } });
};

exports.update = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) throw ApiError.notFound("Exercise not found");
  const canEdit =
    (exercise.user && exercise.user.toString() === req.user._id.toString()) ||
    req.user.role === ROLES.ADMIN;
  if (!canEdit) throw ApiError.forbidden("You can only edit your own custom exercises");

  Object.assign(exercise, pickExerciseFields(req.body));
  await exercise.save();
  res.json({ success: true, data: { exercise } });
};

exports.remove = async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) throw ApiError.notFound("Exercise not found");
  const canDelete =
    (exercise.user && exercise.user.toString() === req.user._id.toString()) ||
    req.user.role === ROLES.ADMIN;
  if (!canDelete) throw ApiError.forbidden("You can only delete your own custom exercises");

  await exercise.deleteOne();
  res.json({ success: true, message: "Exercise deleted" });
};

function pickExerciseFields(body) {
  const fields = [
    "name",
    "primaryMuscle",
    "secondaryMuscles",
    "equipment",
    "difficulty",
    "category",
    "instructions",
    "imageUrl",
    "videoUrl",
  ];
  const out = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}
