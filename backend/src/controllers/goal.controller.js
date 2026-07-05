const Goal = require("../models/Goal");
const { createNotification } = require("../services/notification.service");

exports.list = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort("achieved -createdAt");
  res.json({ success: true, data: { goals } });
};

exports.create = async (req, res) => {
  const { type, title, target, current = 0, unit, deadline } = req.body;
  const goal = await Goal.create({
    user: req.user._id,
    type,
    title,
    target,
    current,
    unit,
    deadline,
  });
  res.status(201).json({ success: true, data: { goal } });
};

exports.update = async (req, res) => {
  const goal = req.doc;
  const wasAchieved = goal.achieved;

  for (const field of ["title", "target", "current", "unit", "deadline", "achieved"]) {
    if (req.body[field] !== undefined) goal[field] = req.body[field];
  }
  // Auto-achieve when a numeric target is met
  if (!goal.achieved && goal.target > 0 && goal.current >= goal.target) {
    goal.achieved = true;
  }
  if (goal.achieved && !wasAchieved) {
    goal.achievedAt = new Date();
    await createNotification(req.user._id, {
      type: "goal-achieved",
      title: "Goal achieved! 🎯",
      body: goal.title,
      meta: { goalId: goal._id },
    });
  }
  await goal.save();
  res.json({ success: true, data: { goal } });
};

exports.remove = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Goal deleted" });
};
