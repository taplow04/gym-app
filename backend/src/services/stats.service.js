const mongoose = require("mongoose");
const WorkoutSession = require("../models/WorkoutSession");
const Measurement = require("../models/Measurement");

const oid = (id) => new mongoose.Types.ObjectId(String(id));

/** All-time overview: totals + current/best week streak. */
async function overview(userId) {
  const [totals] = await WorkoutSession.aggregate([
    { $match: { user: oid(userId), status: "completed" } },
    {
      $group: {
        _id: null,
        workouts: { $sum: 1 },
        totalVolumeKg: { $sum: "$totalVolumeKg" },
        totalSets: { $sum: "$totalSets" },
        totalDurationSec: { $sum: "$durationSec" },
      },
    },
  ]);

  const dates = await WorkoutSession.find({ user: userId, status: "completed" })
    .distinct("finishedAt");
  const { current, best } = weekStreaks(dates);

  return {
    workouts: totals?.workouts || 0,
    totalVolumeKg: totals?.totalVolumeKg || 0,
    totalSets: totals?.totalSets || 0,
    totalDurationSec: totals?.totalDurationSec || 0,
    currentWeekStreak: current,
    bestWeekStreak: best,
  };
}

/** Monday (00:00 local server time) of the week containing d */
function startOfWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function weekStreaks(dates) {
  if (dates.length === 0) return { current: 0, best: 0 };
  const weeks = [...new Set(dates.map((d) => startOfWeek(d).getTime()))].sort((a, b) => a - b);
  const WEEK = 7 * 24 * 3600 * 1000;

  let best = 1;
  let run = 1;
  for (let i = 1; i < weeks.length; i++) {
    run = weeks[i] - weeks[i - 1] === WEEK ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // Current: walk back from this week (in-progress week doesn't break it)
  const thisWeek = startOfWeek(new Date()).getTime();
  const set = new Set(weeks);
  let cursor = set.has(thisWeek) ? thisWeek : thisWeek - WEEK;
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor -= WEEK;
  }
  return { current, best };
}

/** Per-period buckets (day for weekly view, ISO week for monthly+). */
async function summary(userId, from, to, granularity = "day") {
  const format = granularity === "week" ? "%G-W%V" : "%Y-%m-%d";
  return WorkoutSession.aggregate([
    {
      $match: {
        user: oid(userId),
        status: "completed",
        finishedAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format, date: "$finishedAt" } },
        workouts: { $sum: 1 },
        volumeKg: { $sum: "$totalVolumeKg" },
        sets: { $sum: "$totalSets" },
        durationSec: { $sum: "$durationSec" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", workouts: 1, volumeKg: 1, sets: 1, durationSec: 1 } },
  ]);
}

/** Strength progression for one exercise: best set per session over time. */
async function exerciseProgress(userId, exerciseName, limit = 50) {
  return WorkoutSession.aggregate([
    { $match: { user: oid(userId), status: "completed" } },
    { $unwind: "$entries" },
    { $match: { "entries.name": exerciseName } },
    { $unwind: "$entries.sets" },
    {
      $match: {
        "entries.sets.done": true,
        "entries.sets.type": { $ne: "warmup" },
        "entries.sets.weightKg": { $gt: 0 },
      },
    },
    {
      $group: {
        _id: "$_id",
        date: { $first: "$finishedAt" },
        bestWeightKg: { $max: "$entries.sets.weightKg" },
        volumeKg: {
          $sum: { $multiply: ["$entries.sets.weightKg", "$entries.sets.reps"] },
        },
        sets: { $sum: 1 },
      },
    },
    { $sort: { date: 1 } },
    { $limit: limit },
    { $project: { _id: 0, session: "$_id", date: 1, bestWeightKg: 1, volumeKg: 1, sets: 1 } },
  ]);
}

/** Body-weight trend from measurements. */
async function weightHistory(userId, limit = 90) {
  return Measurement.find({ user: userId, weightKg: { $exists: true } })
    .sort("-date")
    .limit(limit)
    .select("date weightKg bodyFatPct -_id")
    .lean()
    .then((rows) => rows.reverse());
}

module.exports = { overview, summary, exerciseProgress, weightHistory };
