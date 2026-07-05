const PersonalRecord = require("../models/PersonalRecord");

const est1RM = (weightKg, reps) =>
  reps === 1 ? weightKg : Math.round(weightKg * (1 + reps / 30));

/**
 * Evaluate a completed session against the user's records; upsert any
 * beaten bests. Returns descriptors of the new PRs for notifications.
 * Warm-up sets never count.
 */
async function updateRecordsFromSession(session) {
  const newPRs = [];

  // Per-exercise aggregates from this session
  const byExercise = new Map();
  for (const entry of session.entries) {
    const key = entry.name;
    if (!byExercise.has(key)) {
      byExercise.set(key, { exercise: entry.exercise, name: key, sets: [], volume: 0 });
    }
    const agg = byExercise.get(key);
    for (const set of entry.sets) {
      if (!set.done || set.type === "warmup") continue;
      agg.sets.push(set);
      agg.volume += (set.weightKg || 0) * (set.reps || 0);
    }
  }

  for (const agg of byExercise.values()) {
    if (agg.sets.length === 0) continue;

    const record =
      (await PersonalRecord.findOne({ user: session.user, exerciseName: agg.name })) ||
      new PersonalRecord({
        user: session.user,
        exercise: agg.exercise,
        exerciseName: agg.name,
      });

    const stamp = { date: session.finishedAt, session: session._id };
    let improved = false;

    for (const set of agg.sets) {
      if ((set.weightKg || 0) <= 0 || (set.reps || 0) <= 0) continue;

      if (!record.bestWeight?.weightKg || set.weightKg > record.bestWeight.weightKg) {
        record.bestWeight = { weightKg: set.weightKg, reps: set.reps, ...stamp };
        improved = true;
        newPRs.push({ exerciseName: agg.name, kind: "weight", weightKg: set.weightKg, reps: set.reps });
      }
      const est = est1RM(set.weightKg, set.reps);
      if (!record.bestEst1RM?.valueKg || est > record.bestEst1RM.valueKg) {
        record.bestEst1RM = { valueKg: est, weightKg: set.weightKg, reps: set.reps, ...stamp };
        improved = true;
      }
      if (!record.bestReps?.reps || set.reps > record.bestReps.reps) {
        record.bestReps = { reps: set.reps, weightKg: set.weightKg, ...stamp };
        improved = true;
      }
    }

    if (agg.volume > 0 && (!record.bestVolume?.volumeKg || agg.volume > record.bestVolume.volumeKg)) {
      record.bestVolume = { volumeKg: Math.round(agg.volume), ...stamp };
      improved = true;
    }

    if (improved) await record.save();
  }

  // Only weight PRs are celebrated — est-1RM/reps/volume follow silently.
  return newPRs;
}

module.exports = { updateRecordsFromSession, est1RM };
