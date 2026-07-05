const Reminder = require("../models/Reminder");

exports.list = async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).sort("time");
  res.json({ success: true, data: { reminders } });
};

exports.create = async (req, res) => {
  const { type, time, days, message, enabled = true } = req.body;
  const reminder = await Reminder.create({
    user: req.user._id,
    type,
    time,
    days,
    message,
    enabled,
  });
  res.status(201).json({ success: true, data: { reminder } });
};

exports.update = async (req, res) => {
  for (const field of ["type", "time", "days", "message", "enabled"]) {
    if (req.body[field] !== undefined) req.doc[field] = req.body[field];
  }
  await req.doc.save();
  res.json({ success: true, data: { reminder: req.doc } });
};

exports.remove = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Reminder deleted" });
};
