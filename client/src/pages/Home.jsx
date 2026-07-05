import { useMemo } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { DEFAULT_PLAN, DAY_NAMES } from "../data/defaultPlan";
import {
  weekStreak,
  thisWeekSessions,
  sessionVolume,
  sessionSetCount,
  formatVolume,
} from "../lib/stats";
import { weekdayIndex, fmtLongToday, lastNDays, fmtMedium, fmtDuration } from "../lib/dates";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";

const QUOTES = [
  "The last three reps make the muscle grow.",
  "You don't have to be extreme, just consistent.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Discipline is choosing what you want most over what you want now.",
  "Small daily improvements are the key to staggering long-term results.",
  "The only bad workout is the one that didn't happen.",
  "Strength doesn't come from what you can do — it comes from overcoming what you couldn't.",
  "Motivation gets you started. Habit keeps you going.",
  "Sweat is just fat crying.",
  "A one-hour workout is 4% of your day. No excuses.",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const [history] = useLocalStorage("history", []);
  const [plan] = useLocalStorage("plan", DEFAULT_PLAN);
  const [active] = useLocalStorage("activeSession", null);
  const [profile] = useLocalStorage("profile", { name: "", unit: "kg", restSec: 90 });

  const todayIdx = weekdayIndex();
  const today = plan[todayIdx];

  const week = useMemo(() => {
    const sessions = thisWeekSessions(history);
    return {
      count: sessions.length,
      volume: sessions.reduce((sum, s) => sum + sessionVolume(s), 0),
      sets: sessions.reduce((sum, s) => sum + sessionSetCount(s), 0),
    };
  }, [history]);

  const streak = useMemo(() => weekStreak(history), [history]);

  const weekDots = useMemo(() => {
    const trained = new Set(history.map((s) => s.dateKey));
    const days = lastNDays(7);
    return days.map((key, i) => ({
      key,
      letter: "MTWTFSS"[(weekdayIndex(new Date()) + 1 + i) % 7],
      done: trained.has(key),
      isToday: i === 6,
    }));
  }, [history]);

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const recent = history.slice(0, 3);

  return (
    <main className="page">
      <header className="home-head">
        <div>
          <span className="overline">{fmtLongToday()}</span>
          <h1 className="home-greet">
            {greeting()}
            {profile.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
          </h1>
        </div>
        {streak > 0 && (
          <span className="streak-chip" title={`${streak}-week training streak`}>
            <Icon name="flame" size={16} strokeWidth={2.2} /> {streak}wk
          </span>
        )}
      </header>

      {/* ---- Today / resume ---- */}
      <section className="section">
        {active ? (
          <div className="card card--accent today-card">
            <span className="overline">In progress</span>
            <h2 className="today-focus">{active.title}</h2>
            <Link to="/workout" className="btn btn--primary btn--lg btn--full">
              <Icon name="play" size={18} /> Resume workout
            </Link>
          </div>
        ) : today.rest ? (
          <div className="card today-card">
            <span className="overline">Today · {DAY_NAMES[todayIdx]}</span>
            <h2 className="today-focus">Rest day</h2>
            <p style={{ color: "var(--text-2)", fontSize: "var(--fs-sm)" }}>
              Recovery is where the muscle is built. Stretch, hydrate, sleep well.
            </p>
          </div>
        ) : (
          <div className="card card--accent today-card">
            <span className="overline">Today · {DAY_NAMES[todayIdx]}</span>
            <h2 className="today-focus">{today.focus}</h2>
            <div className="today-meta">
              <span>
                <Icon name="dumbbell" size={15} /> {today.exercises.length} exercises
              </span>
              <span>
                <Icon name="clock" size={15} /> ~{Math.max(20, today.exercises.length * 10)} min
              </span>
            </div>
            <Link to="/workout" className="btn btn--primary btn--lg btn--full">
              <Icon name="play" size={18} /> Start workout
            </Link>
          </div>
        )}
      </section>

      {/* ---- This week ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">This week</h2>
          <Link to="/progress" className="section-link">
            Details
          </Link>
        </div>
        <div className="stat-row">
          <div className="stat-tile">
            <span className="stat-label">Workouts</span>
            <span className="stat-value">{week.count}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Volume</span>
            <span className="stat-value">{formatVolume(week.volume)}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Sets</span>
            <span className="stat-value">{week.sets}</span>
          </div>
        </div>
      </section>

      {/* ---- Last 7 days ---- */}
      <section className="section">
        <div className="card">
          <div className="week-dots">
            {weekDots.map((d) => (
              <div
                key={d.key}
                className={`week-dot${d.done ? " done" : ""}${d.isToday ? " today-marker" : ""}`}
              >
                <span className="week-dot-disc">
                  {d.done ? <Icon name="check" size={16} strokeWidth={3} /> : d.letter}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Recent workouts ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Recent workouts</h2>
        </div>
        <div className="card">
          {recent.length === 0 ? (
            <EmptyState
              icon="dumbbell"
              title="No workouts yet"
              sub="Your first session is one tap away — hit Start below."
            />
          ) : (
            recent.map((s) => (
              <div key={s.id} className="row">
                <div className="row-main">
                  <div className="row-title">{s.title}</div>
                  <div className="row-sub">
                    {fmtMedium(s.dateKey)} · {fmtDuration(s.finishedAt - s.startedAt)} ·{" "}
                    {formatVolume(sessionVolume(s))}
                  </div>
                </div>
                <span className="badge badge--muted">{sessionSetCount(s)} sets</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---- Daily quote ---- */}
      <section className="section">
        <div className="card quote-card">
          <Icon name="zap" size={18} />
          <span>&ldquo;{quote}&rdquo;</span>
        </div>
      </section>
    </main>
  );
}
