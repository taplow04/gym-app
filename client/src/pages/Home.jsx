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
  levelInfo,
} from "../lib/stats";
import {
  weekdayIndex,
  fmtLongToday,
  lastNDays,
  fmtMedium,
  fmtDuration,
  todayKey,
} from "../lib/dates";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/Toast";

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
  const [water, setWater] = useLocalStorage("water", {});
  const toast = useToast();

  const todayIdx = weekdayIndex();
  const today = plan[todayIdx];
  const waterGoal = profile.waterGoal || 2500;
  const waterToday = water[todayKey()] || 0;

  const addWater = (ml) => {
    const next = Math.max(0, waterToday + ml);
    setWater((prev) => ({ ...prev, [todayKey()]: next }));
    if (ml > 0 && waterToday < waterGoal && next >= waterGoal) {
      toast("Water goal hit — nice! 💧", "success");
    }
  };

  const level = useMemo(() => levelInfo(history), [history]);

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
        <div className="home-chips">
          {history.length > 0 && (
            <span className="level-chip" title={`Level ${level.level} — ${level.xp} XP`}>
              <Icon name="award" size={15} strokeWidth={2.2} /> Lv {level.level}
            </span>
          )}
          {streak > 0 && (
            <span className="streak-chip" title={`${streak}-week training streak`}>
              <Icon name="flame" size={16} strokeWidth={2.2} /> {streak}wk
            </span>
          )}
        </div>
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

      {/* ---- Quick actions ---- */}
      <section className="section">
        <div className="quick-actions">
          <Link to="/workout" className="quick-action">
            <span className="quick-action-icon"><Icon name="play" size={20} /></span>
            Workout
          </Link>
          <Link to="/timer" className="quick-action">
            <span className="quick-action-icon"><Icon name="timer" size={20} /></span>
            Timer
          </Link>
          <Link to="/progress" className="quick-action">
            <span className="quick-action-icon"><Icon name="scale" size={20} /></span>
            Log weight
          </Link>
          <button className="quick-action" onClick={() => addWater(250)}>
            <span className="quick-action-icon"><Icon name="droplet" size={20} /></span>
            +250ml
          </button>
        </div>
      </section>

      {/* ---- Water ---- */}
      <section className="section">
        <div className="card water-card">
          <div className="water-head">
            <span className="water-title">
              <Icon name="droplet" size={16} /> Water today
            </span>
            <span className="water-amount">
              {(waterToday / 1000).toFixed(waterToday % 1000 === 0 ? 0 : 2)}L
              <span className="water-goal"> / {(waterGoal / 1000).toFixed(1)}L</span>
            </span>
          </div>
          <div className="meter water-meter">
            <div
              className="meter-fill water-fill"
              style={{ width: `${Math.min(100, (waterToday / waterGoal) * 100)}%` }}
            />
          </div>
          <div className="water-actions">
            <button className="chip" onClick={() => addWater(-250)} aria-label="Remove 250 millilitres">
              <Icon name="minus" size={14} strokeWidth={2.5} /> 250
            </button>
            <button className="chip" onClick={() => addWater(250)}>+250ml</button>
            <button className="chip" onClick={() => addWater(500)}>+500ml</button>
          </div>
        </div>
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
