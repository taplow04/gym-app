// FORGE — Training math: volume, PRs, streaks, weekly aggregates,
// XP/levels, achievements, muscle distribution.
// A "session" is { id, dateKey, title, startedAt, finishedAt,
//   entries: [{ exId, name, muscle, note?, sets: [{ weight, reps, done, type? }] }] }
// set.type: undefined = working set, "w" = warm-up, "d" = drop set.
// Warm-ups count toward nothing — no volume, no PRs.

import { dateKey, fromKey, startOfWeek, addDays, lastNDays } from "./dates";

const isWorking = (s) => s.done && s.type !== "w";

function doneSets(session) {
  return session.entries.flatMap((e) => e.sets.filter(isWorking));
}

/** Total volume (kg lifted) of completed working sets */
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
        if (!isWorking(set)) continue;
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

/* ------------------------------------------------------------------ */
/*  Aggregates over a window                                          */
/* ------------------------------------------------------------------ */

/** Totals over the last n days: sessions, volume, sets, duration (ms). */
export function windowTotals(history, days = 30) {
  const keys = new Set(lastNDays(days));
  const sessions = history.filter((s) => keys.has(s.dateKey));
  return {
    sessions: sessions.length,
    volume: sessions.reduce((sum, s) => sum + sessionVolume(s), 0),
    sets: sessions.reduce((sum, s) => sum + sessionSetCount(s), 0),
    durationMs: sessions.reduce(
      (sum, s) => sum + Math.max(0, (s.finishedAt || 0) - (s.startedAt || 0)),
      0
    ),
  };
}

/** Working sets per muscle over the last n days, sorted descending. */
export function muscleDistribution(history, days = 30) {
  const keys = new Set(lastNDays(days));
  const counts = new Map();
  for (const session of history) {
    if (!keys.has(session.dateKey)) continue;
    for (const entry of session.entries) {
      const n = entry.sets.filter(isWorking).length;
      if (n > 0) counts.set(entry.muscle, (counts.get(entry.muscle) || 0) + n);
    }
  }
  return [...counts.entries()]
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}

/* ------------------------------------------------------------------ */
/*  XP & levels — derived from history, never stored                  */
/* ------------------------------------------------------------------ */

export function totalXp(history) {
  return history.reduce((xp, s) => xp + 50 + sessionSetCount(s) * 2, 0);
}

/** Cumulative XP required to REACH level l (l ≥ 1). */
const xpForLevel = (l) => 150 * (l - 1) * l; // 0, 300, 900, 1800, 3000…

export function levelInfo(history) {
  const xp = totalXp(history);
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, xp, into: xp - floor, needed: ceil - floor };
}

/* ------------------------------------------------------------------ */
/*  Achievements — computed, celebratory, never stored                */
/* ------------------------------------------------------------------ */

const ACHIEVEMENTS = [
  { id: "first", name: "First Rep", desc: "Finish your first workout", icon: "zap", test: (h) => h.length >= 1 },
  { id: "ten", name: "Regular", desc: "10 workouts logged", icon: "dumbbell", test: (h) => h.length >= 10 },
  { id: "fifty", name: "Committed", desc: "50 workouts logged", icon: "dumbbell", test: (h) => h.length >= 50 },
  { id: "hundred", name: "Centurion", desc: "100 workouts logged", icon: "trophy", test: (h) => h.length >= 100 },
  { id: "streak4", name: "On Fire", desc: "4-week training streak", icon: "flame", test: (h) => weekStreak(h) >= 4 },
  { id: "streak12", name: "Unstoppable", desc: "12-week training streak", icon: "flame", test: (h) => weekStreak(h) >= 12 },
  { id: "vol10", name: "Ten Tonnes", desc: "10t lifted all time", icon: "trend", test: (h) => h.reduce((v, s) => v + sessionVolume(s), 0) >= 10_000 },
  { id: "vol100", name: "Heavy Industry", desc: "100t lifted all time", icon: "trend", test: (h) => h.reduce((v, s) => v + sessionVolume(s), 0) >= 100_000 },
  { id: "sets1k", name: "Set Collector", desc: "1,000 working sets", icon: "check", test: (h) => h.reduce((n, s) => n + sessionSetCount(s), 0) >= 1000 },
  { id: "pr10", name: "Record Breaker", desc: "PRs on 10 exercises", icon: "trophy", test: (h) => bestSets(h).size >= 10 },
  { id: "early", name: "Early Bird", desc: "Train before 7am", icon: "clock", test: (h) => h.some((s) => new Date(s.startedAt).getHours() < 7) },
  { id: "night", name: "Night Owl", desc: "Train after 9pm", icon: "moon", test: (h) => h.some((s) => new Date(s.startedAt).getHours() >= 21) },
  { id: "week5", name: "Big Week", desc: "5 sessions in one week", icon: "calendar", test: (h) => {
      const perWeek = new Map();
      for (const s of h) {
        const wk = dateKey(startOfWeek(fromKey(s.dateKey)));
        perWeek.set(wk, (perWeek.get(wk) || 0) + 1);
      }
      return [...perWeek.values()].some((n) => n >= 5);
    } },
];

export function achievements(history) {
  return ACHIEVEMENTS.map((a) => ({ ...a, earned: a.test(history) }));
}
