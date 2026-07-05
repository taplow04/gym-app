// FORGE — Local-date helpers. Everything keys on "YYYY-MM-DD" in the
// user's own timezone (never UTC — a 11pm workout belongs to today).

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return dateKey();
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Monday-first weekday index: Mon=0 … Sun=6 */
export function weekdayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

/** Monday of the week containing d */
export function startOfWeek(d = new Date()) {
  return addDays(d, -weekdayIndex(d));
}

export function fmtShort(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function fmtMedium(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtLongToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Last n date keys ending today, oldest first */
export function lastNDays(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    out.push(dateKey(addDays(now, -i)));
  }
  return out;
}

export function fmtDuration(ms) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function fmtClock(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
