// In-process reminder dispatcher. Every minute, finds reminders whose
// HH:mm + weekday match "now" and materializes them as notifications.
// Deliberately simple: no external queue; swap for BullMQ/agenda when
// horizontal scaling demands it.

const Reminder = require("../models/Reminder");
const { createNotification } = require("../services/notification.service");

const TITLES = {
  workout: "Time to train 💪",
  water: "Hydration check 💧",
  meal: "Meal time 🍽️",
  rest: "Rest day — recover well 😴",
};

let timer = null;
let lastTick = null;

async function tick() {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (hhmm === lastTick) return; // one dispatch per minute
  lastTick = hhmm;
  const weekday = (now.getDay() + 6) % 7; // Monday-first, matches frontend

  const due = await Reminder.find({ enabled: true, time: hhmm, days: weekday }).lean();
  await Promise.all(
    due.map((r) =>
      createNotification(r.user, {
        type: "reminder",
        title: TITLES[r.type] || "Reminder",
        body: r.message || `Your ${r.type} reminder`,
      })
    )
  );
}

function startReminderJob() {
  if (timer) return;
  timer = setInterval(() => {
    tick().catch((err) => console.error("reminder job error:", err.message));
  }, 20 * 1000);
  timer.unref(); // never keep the process alive on its own
}

function stopReminderJob() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startReminderJob, stopReminderJob };
