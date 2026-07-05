const WorkoutPlan = require("../models/WorkoutPlan");

exports.list = async (req, res) => {
  const plans = await WorkoutPlan.find({ user: req.user._id }).sort("-isActive -updatedAt");
  res.json({ success: true, data: { plans } });
};

exports.get = async (req, res) => {
  // ownership middleware already loaded + authorized req.doc
  const plan = await req.doc.populate("days.exercises.exercise", "name primaryMuscle equipment");
  res.json({ success: true, data: { plan } });
};

exports.create = async (req, res) => {
  const { name, description, days, isTemplate = false } = req.body;
  const hasActive = await WorkoutPlan.exists({ user: req.user._id, isActive: true });
  const plan = await WorkoutPlan.create({
    user: req.user._id,
    name,
    description,
    days,
    isTemplate,
    isActive: !isTemplate && !hasActive, // first real plan becomes active
  });
  res.status(201).json({ success: true, data: { plan } });
};

exports.update = async (req, res) => {
  const plan = req.doc;
  for (const field of ["name", "description", "days", "isTemplate"]) {
    if (req.body[field] !== undefined) plan[field] = req.body[field];
  }
  await plan.save();
  res.json({ success: true, data: { plan } });
};

/** Exactly one active plan per user. */
exports.activate = async (req, res) => {
  await WorkoutPlan.updateMany({ user: req.user._id }, { isActive: false });
  req.doc.isActive = true;
  await req.doc.save();
  res.json({ success: true, data: { plan: req.doc } });
};

exports.remove = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Plan deleted" });
};
