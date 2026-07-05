const mongoose = require("mongoose");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { deleteImage } = require("./upload.service");

const PROFILE_FIELDS = [
  "name",
  "gender",
  "dateOfBirth",
  "heightCm",
  "weightKg",
  "targetWeightKg",
  "fitnessGoal",
  "activityLevel",
  "experienceLevel",
  "bio",
  "location",
];

/** Whitelist-copy: request bodies never patch the document blindly. */
async function updateProfile(user, payload) {
  for (const field of PROFILE_FIELDS) {
    if (payload[field] !== undefined) user[field] = payload[field];
  }
  await user.save();
  return user;
}

async function updatePreferences(user, payload) {
  const p = user.preferences;
  for (const key of ["units", "theme", "language", "restSec"]) {
    if (payload[key] !== undefined) p[key] = payload[key];
  }
  if (payload.notifications) Object.assign(p.notifications, payload.notifications);
  if (payload.privacy) Object.assign(p.privacy, payload.privacy);
  await user.save();
  return user;
}

async function setProfilePicture(user, { url, publicId }) {
  const fresh = await User.findById(user._id).select("+profilePicture.publicId");
  const oldPublicId = fresh.profilePicture?.publicId;
  fresh.profilePicture = { url, publicId };
  await fresh.save();
  await deleteImage(oldPublicId); // clean the replaced asset
  return fresh;
}

/** GDPR-style hard delete: user + every collection that references them. */
async function deleteAccount(userId) {
  // Collect Cloudinary ids before the documents disappear.
  const [owner, photos] = await Promise.all([
    User.findById(userId).select("+profilePicture.publicId"),
    mongoose.model("ProgressPhoto").find({ user: userId }).select("+publicId"),
  ]);
  const assetIds = [
    owner?.profilePicture?.publicId,
    ...photos.map((p) => p.publicId),
  ].filter(Boolean);

  const collections = [
    "WorkoutPlan",
    "WorkoutSession",
    "Measurement",
    "ProgressPhoto",
    "PersonalRecord",
    "Goal",
    "Reminder",
    "Notification",
    "Exercise", // only the user's custom exercises have user set
  ];
  await Promise.all(
    collections.map((name) => mongoose.model(name).deleteMany({ user: userId }))
  );
  await RefreshToken.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  // Assets last: if a DB step above throws, the account (and its images)
  // still exist. deleteImage never throws — a leftover asset is tolerable.
  await Promise.all(assetIds.map((id) => deleteImage(id)));
}

module.exports = { updateProfile, updatePreferences, setProfilePicture, deleteAccount };
