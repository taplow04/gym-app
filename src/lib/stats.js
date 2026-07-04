// FORGE — Training math: volume, PRs, streaks, weekly aggregates.
// A "session" is { id, dateKey, title, startedAt, finishedAt,
//   entries: [{ exId, name, muscle, sets: [{ weight, reps, done }] }] }

import { dateKey, fromKey, startOfWeek, addDays } from "./dates";

function doneSets(session) {
  return session.entries.flatMap((e) => e.sets.filter((s) => s.done));
}

/** Total volume (kg lifted) of completed sets */
export function sessionVolume(session) {
  return doneSets(session).reduce(
    (sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
    0
  );
}

export function sessionSetCount(session) {
  return doneSets(session).length;
}

/** Epley estimated one-rep max */
export function est1RM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30));
}

/**
 * Best set per exercise across history, ranked by estimated 1RM.
 * Returns Map<exId, { exId, name, muscle, weight, reps, est, dateKey }>.
 */
export function bestSets(history) {
  const best = new Map();
  for (const session of history) {
    for (const entry of session.entries) {
      for (const set of entry.sets) {
        if (!set.done) continue;
        const est = est1RM(set.weight, set.reps);
        if (est <= 0) continue;
        const current = best.get(entry.exId);
        if (!current || est > current.est) {
          best.set(entry.exId, {
            exId: entry.exId,
            name: entry.name,
            muscle: entry.muscle,
            weight: Number(set.weight),
            reps: Number(set.reps),
            est,
            dateKey: session.dateKey,
          });
        }
      }
    }
  }
  return best;
}

/** New PRs a just-finished session sets vs. prior history */
export function detectPRs(session, priorHistory) {
  const prior = bestSets(priorHistory);
  const now = bestSets([session]);
  const prs = [];
  for (const [exId, candidate] of now) {
    const old = prior.get(exId);
    if (!old || candidate.est > old.est) {
      prs.push(candidate);
    }
  }
  return prs;
}

/**
 * Streak of consecutive weeks with ≥1 workout, counting back from this
 * week (an untrained current week doesn't break it — the week isn't over).
 */
export function weekStreak(history) {
  if (history.length === 0) return 0;
  const trained = new Set(
    history.map((s) => dateKey(startOfWeek(fromKey(s.dateKey))))
  );
  let cursor = startOfWeek(new Date());
  let streak = 0;
  if (!trained.has(dateKey(cursor))) {
    cursor = addDays(cursor, -7); // current week still in progress
  }
  while (trained.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

/** Sessions whose date falls in the current Monday-first week */
export function thisWeekSessions(history) {
  const weekStart = dateKey(startOfWeek(new Date()));
  return history.filter(
    (s) => dateKey(startOfWeek(fromKey(s.dateKey))) === weekStart
  );
}

/** Map<dateKey, setCount> for heatmap intensity */
export function setsPerDay(history) {
  const map = new Map();
  for (const s of history) {
    map.set(s.dateKey, (map.get(s.dateKey) || 0) + sessionSetCount(s));
  }
  return map;
}

/** Bucket a day's set count into heatmap levels 0–5 */
export function heatLevel(sets) {
  if (!sets) return 0;
  if (sets <= 5) return 1;
  if (sets <= 10) return 2;
  if (sets <= 15) return 3;
  if (sets <= 22) return 4;
  return 5;
}

export function formatVolume(kg) {
  if (kg >= 1000) {
    const t = kg / 1000;
    return `${t >= 10 ? Math.round(t) : t.toFixed(1)}t`;
  }
  return `${Math.round(kg)}kg`;
}
