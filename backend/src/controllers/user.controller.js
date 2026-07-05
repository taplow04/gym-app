const User = require("../models/User");
const userService = require("../services/user.service");
const { uploadImage } = require("../services/upload.service");
const ApiError = require("../utils/ApiError");

exports.getMe = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.updateMe = async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  res.json({ success: true, data: { user } });
};

exports.updatePreferences = async (req, res) => {
  const user = await userService.updatePreferences(req.user, req.body);
  res.json({ success: true, data: { user } });
};

exports.updateProfilePicture = async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image file provided (field: image)");
  const uploaded = await uploadImage(req.file.buffer, "avatars");
  const user = await userService.setProfilePicture(req.user, uploaded);
  res.json({ success: true, data: { user } });
};

exports.deleteMe = async (req, res) => {
  await userService.deleteAccount(req.user._id);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ success: true, message: "Account and all data deleted" });
};

// ── Admin ──
exports.listUsers = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const [users, total] = await Promise.all([
    User.find().sort("-createdAt").skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ success: true, data: { users, total, page, pages: Math.ceil(total / limit) } });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: { user } });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  await userService.deleteAccount(user._id);
  res.json({ success: true, message: "User and all data deleted" });
};
