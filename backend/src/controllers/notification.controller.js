const Notification = require("../models/Notification");

exports.list = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const [notifications, total, unread] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({
    success: true,
    data: { notifications, total, unread, page, pages: Math.ceil(total / limit) },
  });
};

exports.unreadCount = async (req, res) => {
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, data: { unread } });
};

exports.markRead = async (req, res) => {
  req.doc.read = true;
  req.doc.readAt = new Date();
  await req.doc.save();
  res.json({ success: true, data: { notification: req.doc } });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  res.json({ success: true, message: "All notifications marked as read" });
};

exports.remove = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Notification deleted" });
};
