const WorkoutSession = require("../models/WorkoutSession");
const WorkoutPlan = require("../models/WorkoutPlan");
const ApiError = require("../utils/ApiError");
const { updateRecordsFromSession } = require("../services/record.service");
const { createNotification } = require("../services/notification.service");

exports.list = async (req, res) => {
  const { from, to, status } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (from || to) {
    filter.startedAt = {};
    if (from) filter.startedAt.$gte = new Date(from);
    if (to) filter.startedAt.$lte = new Date(to);
  }

  const [sessions, total] = await Promise.all([
    WorkoutSession.find(filter)
      .sort("-startedAt")
      .skip((page - 1) * limit)
      .limit(limit),
    WorkoutSession.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { sessions, total, page, pages: Math.ceil(total / limit) },
  });
};

exports.get = (req, res) => {
  res.json({ success: true, data: { session: req.doc } });
};

/** The user's currently active session, if any (frontend resume flow). */
exports.getActive = async (req, res) => {
  const session = await WorkoutSession.findOne({ user: req.user._id, status: "active" });
  res.json({ success: true, data: { session } });
};

/**
 * Start a session. Three shapes:
 *  { plan, dayIndex }  → seeded from a plan day (targets become empty sets)
 *  { entries }         → custom pre-filled workout
 *  {}                  → empty workout
 * One active session per user.
 */
exports.create = async (req, res) => {
  const existing = await WorkoutSession.findOne({ user: req.user._id, status: "active" });
  if (existing) {
    throw ApiError.conflict("You already have an active workout — finish or discard it first");
  }

  let { title, entries = [] } = req.body;
  const { plan: planId, dayIndex } = req.body;

  if (planId != null && dayIndex != null) {
    const plan = await WorkoutPlan.findOne({ _id: planId, user: req.user._id }).populate(
      "days.exercises.exercise",
      "name primaryMuscle"
    );
    if (!plan) throw ApiError.notFound("Plan not found");
    const day = plan.days[dayIndex];
    if (!day || day.rest) throw ApiError.badRequest("That day is a rest day");

    title = title || day.focus;
    entries = day.exercises
      .filter((pe) => pe.exercise) // exercise may have been deleted
      .map((pe) => ({
        exercise: pe.exercise._id,
        name: pe.exercise.name,
        muscle: pe.exercise.primaryMuscle,
        sets: Array.from({ length: pe.targetSets }, () => ({
          type: "normal",
          weightKg: 0,
          reps: 0,
          restSec: pe.restSec,
          done: false,
        })),
      }));
  }

  const session = await WorkoutSession.create({
    user: req.user._id,
    plan: planId || null,
    title: title || "Workout",
    entries,
  });
  res.status(201).json({ success: true, data: { session } });
};

/** Live logging: replace title/notes/entries wholesale (idempotent sync). */
exports.update = async (req, res) => {
  const session = req.doc;
  if (session.status === "completed") {
    throw ApiError.badRequest("Completed workouts cannot be edited");
  }
  for (const field of ["title", "notes", "entries"]) {
    if (req.body[field] !== undefined) session[field] = req.body[field];
  }
  await session.save();
  res.json({ success: true, data: { session } });
};

/** Freeze totals, evaluate PRs, notify. */
exports.complete = async (req, res) => {
  const session = req.doc;
  if (session.status === "completed") {
    throw ApiError.badRequest("Workout is already completed");
  }
  if (req.body.entries !== undefined) session.entries = req.body.entries; // final sync
  if (req.body.notes !== undefined) session.notes = req.body.notes;

  const { totalVolumeKg, totalSets } = session.computeTotals();
  if (totalSets === 0) {
    throw ApiError.badRequest("Complete at least one working set before finishing");
  }

  session.status = "completed";
  session.finishedAt = new Date();
  session.durationSec = Math.round((session.finishedAt - session.startedAt) / 1000);
  session.totalVolumeKg = totalVolumeKg;
  session.totalSets = totalSets;
  await session.save();

  const newPRs = await updateRecordsFromSession(session);

  await createNotification(req.user._id, {
    type: "workout-completed",
    title: "Workout complete 🎉",
    body: `${session.title} — ${totalSets} sets, ${totalVolumeKg}kg volume`,
    meta: { sessionId: session._id },
  });
  if (newPRs.length > 0 && req.user.preferences.notifications.prAlerts) {
    await createNotification(req.user._id, {
      type: "new-pr",
      title: `New PR${newPRs.length > 1 ? "s" : ""}! 🏆`,
      body: newPRs.map((pr) => `${pr.exerciseName}: ${pr.weightKg}kg × ${pr.reps}`).join(" · "),
      meta: { sessionId: session._id },
    });
  }

  res.json({ success: true, data: { session, newPRs } });
};

exports.remove = async (req, res) => {
  await req.doc.deleteOne();
  res.json({ success: true, message: "Workout deleted" });
};
