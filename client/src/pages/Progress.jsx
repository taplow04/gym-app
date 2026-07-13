import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  bestSets,
  weekStreak,
  thisWeekSessions,
  setsPerDay,
  sessionVolume,
  sessionSetCount,
  formatVolume,
  windowTotals,
  muscleDistribution,
  achievements,
  levelInfo,
} from "../lib/stats";
import { todayKey, fmtShort, fmtMedium, fmtDuration } from "../lib/dates";
import Icon from "../components/Icon";
import Heatmap from "../components/Heatmap";
import WeightChart from "../components/WeightChart";
import EmptyState from "../components/EmptyState";
import Sheet from "../components/Sheet";
import { useToast } from "../components/Toast";

const MEASURE_PARTS = ["Neck", "Shoulders", "Chest", "Arm", "Forearm", "Waist", "Hips", "Thigh", "Calf"];

/** Full detail of a past session: every entry + set, repeat & delete. */
function SessionSheet({ session, unit, onRepeat, onDelete, onClose }) {
  const [deleteArmed, setDeleteArmed] = useState(false);
  return (
    <Sheet title={session.title} onClose={onClose}>
      <p style={{ color: "var(--text-3)", fontSize: "var(--fs-sm)", marginBottom: "var(--sp-3)" }}>
        {fmtMedium(session.dateKey)} · {fmtDuration(session.finishedAt - session.startedAt)} ·{" "}
        {formatVolume(sessionVolume(session))} · {sessionSetCount(session)} sets
      </p>

      {session.entries.map((entry, i) => (
        <div key={`${entry.exId}-${i}`} className="row">
          <div className="row-main">
            <div className="row-title">{entry.name}</div>
            <div className="row-sub">
              {entry.sets.map((s, j) => (
                <span key={j}>
                  {j > 0 && " · "}
                  {s.type === "w" ? "W " : s.type === "d" ? "D " : ""}
                  {s.weight || 0}{unit}×{s.reps}
                </span>
              ))}
              {entry.note ? <em> — {entry.note}</em> : null}
            </div>
          </div>
        </div>
      ))}

      <button
        className="btn btn--primary btn--full btn--lg"
        style={{ marginTop: "var(--sp-4)" }}
        onClick={() => onRepeat(session)}
      >
        <Icon name="repeat" size={18} /> Repeat this workout
      </button>
      <button
        className={`btn btn--full ${deleteArmed ? "btn--danger" : "btn--ghost"}`}
        style={{ marginTop: "var(--sp-2)" }}
        onClick={() => {
          if (!deleteArmed) {
            setDeleteArmed(true);
            setTimeout(() => setDeleteArmed(false), 3000);
            return;
          }
          onDelete(session.id);
        }}
      >
        <Icon name="trash" size={17} />
        {deleteArmed ? "Tap again to delete forever" : "Delete workout"}
      </button>
    </Sheet>
  );
}

export default function Progress() {
  const [history, setHistory] = useLocalStorage("history", []);
  const [active, setActive] = useLocalStorage("activeSession", null);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [goals, setGoals] = useLocalStorage("goals", []);
  const [measurements, setMeasurements] = useLocalStorage("measurements", []);
  const [profile, setProfile] = useLocalStorage("profile", { name: "", unit: "kg", restSec: 90 });
  const [weightInput, setWeightInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [targetOpen, setTargetOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [measurePart, setMeasurePart] = useState(MEASURE_PARTS[0]);
  const [measureValue, setMeasureValue] = useState("");
  const [openSession, setOpenSession] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const unit = profile.unit || "kg";
  const weeklyGoal = profile.weeklyGoal || 3;

  const stats = useMemo(() => {
    const totalVolume = history.reduce((sum, s) => sum + sessionVolume(s), 0);
    return {
      total: history.length,
      week: thisWeekSessions(history).length,
      streak: weekStreak(history),
      volume: totalVolume,
      byDay: setsPerDay(history),
      prs: [...bestSets(history).values()].sort((a, b) => b.est - a.est),
      month: windowTotals(history, 30),
      muscles: muscleDistribution(history, 30),
      badges: achievements(history),
      level: levelInfo(history),
    };
  }, [history]);

  const sortedWeights = useMemo(
    () => [...weights].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [weights]
  );

  /* ---------- body weight & target ---------- */

  const addWeight = (e) => {
    e.preventDefault();
    const value = Number(weightInput);
    if (!(value > 0)) {
      toast("Enter a valid weight", "danger");
      return;
    }
    const today = todayKey();
    setWeights((prev) => [
      ...prev.filter((w) => w.date !== today),
      { date: today, weight: value },
    ]);
    setWeightInput("");
    toast("Weight logged", "success");
  };

  const saveTarget = (e) => {
    e.preventDefault();
    const value = Number(targetInput);
    setProfile((prev) => ({ ...prev, targetWeight: value > 0 ? value : undefined }));
    setTargetOpen(false);
    setTargetInput("");
    toast(value > 0 ? "Target weight set" : "Target cleared", "success");
  };

  const current = sortedWeights[sortedWeights.length - 1]?.weight;
  const start = sortedWeights[0]?.weight;
  const target = profile.targetWeight;
  let targetPct = null;
  if (target && current != null && start != null && start !== target) {
    targetPct = Math.max(0, Math.min(100, ((start - current) / (start - target)) * 100));
  }

  /* ---------- measurements ---------- */

  const addMeasurement = (e) => {
    e.preventDefault();
    const value = Number(measureValue);
    if (!(value > 0)) {
      toast("Enter a valid measurement", "danger");
      return;
    }
    setMeasurements((prev) => [
      ...prev,
      { id: Date.now(), date: todayKey(), part: measurePart, value },
    ]);
    setMeasureValue("");
    toast(`${measurePart} logged`, "success");
  };

  const latestMeasurements = useMemo(() => {
    const byPart = new Map();
    for (const m of measurements) {
      const list = byPart.get(m.part) || [];
      list.push(m);
      byPart.set(m.part, list);
    }
    return MEASURE_PARTS.filter((p) => byPart.has(p)).map((part) => {
      const list = byPart.get(part).sort((a, b) => (a.date < b.date ? -1 : 1));
      const latest = list[list.length - 1];
      const prev = list[list.length - 2];
      return { part, latest, delta: prev ? latest.value - prev.value : null };
    });
  }, [measurements]);

  /* ---------- history ---------- */

  const repeatSession = (session) => {
    if (active) {
      toast("Finish or discard your current workout first", "danger");
      return;
    }
    setActive({
      id: Date.now(),
      dateKey: todayKey(),
      title: session.title,
      startedAt: Date.now(),
      entries: session.entries.map((e) => ({
        exId: e.exId,
        name: e.name,
        muscle: e.muscle,
        sets: e.sets.map((s) => ({ weight: s.weight, reps: s.reps, done: false, type: s.type })),
      })),
    });
    setOpenSession(null);
    navigate("/workout");
  };

  const deleteSession = (id) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
    setOpenSession(null);
    toast("Workout deleted", "info");
  };

  /* ---------- freeform goals ---------- */

  const addGoal = (e) => {
    e.preventDefault();
    const text = goalInput.trim();
    if (!text) return;
    setGoals((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setGoalInput("");
  };

  const toggleGoal = (id) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

  const deleteGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const doneGoals = goals.filter((g) => g.done).length;
  const maxMuscleSets = stats.muscles[0]?.sets || 1;
  const earnedCount = stats.badges.filter((b) => b.earned).length;
  const visibleHistory = showAllHistory ? history : history.slice(0, 6);

  return (
    <main className="page">
      <h1 className="page-title">Progress</h1>

      {/* ---- Overview tiles ---- */}
      <section className="section">
        <div className="progress-grid">
          <div className="stat-tile">
            <span className="stat-label">Workouts</span>
            <span className="stat-value stat-value--hero">{stats.total}</span>
            <span className="stat-sub">all time</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">This week</span>
            <span className="stat-value stat-value--hero">{stats.week}</span>
            <span className="stat-sub">of {weeklyGoal} planned</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Streak</span>
            <span className="stat-value stat-value--hero">{stats.streak}</span>
            <span className="stat-sub">week{stats.streak === 1 ? "" : "s"} in a row</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Volume</span>
            <span className="stat-value stat-value--hero">{formatVolume(stats.volume)}</span>
            <span className="stat-sub">lifted all time</span>
          </div>
        </div>
      </section>

      {/* ---- Weekly goal ---- */}
      <section className="section">
        <div className="card">
          <div className="section-head" style={{ marginBottom: "var(--sp-2)" }}>
            <span className="overline">Weekly goal</span>
            <span className="badge badge--accent">
              {stats.week}/{weeklyGoal}
            </span>
          </div>
          <div className="meter">
            <div
              className="meter-fill"
              style={{ width: `${Math.min(100, (stats.week / weeklyGoal) * 100)}%` }}
            />
          </div>
          {stats.week >= weeklyGoal && (
            <p style={{ color: "var(--success)", fontSize: "var(--fs-sm)", marginTop: "var(--sp-2)" }}>
              Goal hit — anything more this week is a bonus. 🎯
            </p>
          )}
        </div>
      </section>

      {/* ---- Last 30 days ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Last 30 days</h2>
        </div>
        <div className="stat-row">
          <div className="stat-tile">
            <span className="stat-label">Sessions</span>
            <span className="stat-value">{stats.month.sessions}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Volume</span>
            <span className="stat-value">{formatVolume(stats.month.volume)}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Gym time</span>
            <span className="stat-value">{fmtDuration(stats.month.durationMs)}</span>
          </div>
        </div>
      </section>

      {/* ---- Activity heatmap ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Activity</h2>
        </div>
        <div className="card">
          {history.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No activity yet"
              sub="Finish your first workout and it lights up here."
            />
          ) : (
            <Heatmap setsByDay={stats.byDay} />
          )}
        </div>
      </section>

      {/* ---- Level & achievements ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Achievements</h2>
          <span className="badge badge--accent">{earnedCount}/{stats.badges.length}</span>
        </div>
        <div className="card">
          <div className="level-row">
            <span className="level-badge">
              <Icon name="award" size={18} strokeWidth={2.2} />
            </span>
            <div className="row-main">
              <div className="row-title">Level {stats.level.level}</div>
              <div className="row-sub">
                {stats.level.into}/{stats.level.needed} XP to level {stats.level.level + 1}
              </div>
            </div>
            <span className="badge badge--muted">{stats.level.xp} XP</span>
          </div>
          <div className="meter" style={{ margin: "var(--sp-3) 0 var(--sp-4)" }}>
            <div
              className="meter-fill"
              style={{ width: `${(stats.level.into / stats.level.needed) * 100}%` }}
            />
          </div>

          <div className="badge-grid">
            {stats.badges.map((b) => (
              <div
                key={b.id}
                className={`badge-tile${b.earned ? " earned" : ""}`}
                title={b.desc}
              >
                <span className="badge-tile-icon">
                  <Icon name={b.icon} size={20} strokeWidth={2} />
                </span>
                <span className="badge-tile-name">{b.name}</span>
                <span className="badge-tile-desc">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Personal records ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Personal records</h2>
        </div>
        <div className="card">
          {stats.prs.length === 0 ? (
            <EmptyState
              icon="trophy"
              title="No PRs yet"
              sub="Log weighted sets in a workout — your best lifts appear here automatically."
            />
          ) : (
            stats.prs.slice(0, 8).map((pr) => (
              <div key={pr.exId} className="row">
                <div className="row-main">
                  <div className="row-title">{pr.name}</div>
                  <div className="row-sub">{fmtShort(pr.dateKey)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="pr-weight">
                    {pr.weight}
                    {unit} × {pr.reps}
                  </div>
                  <div className="pr-est">~{pr.est}{unit} 1RM</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---- Muscle focus (30d) ---- */}
      {stats.muscles.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Muscle focus</h2>
            <span className="section-link" style={{ pointerEvents: "none" }}>last 30 days</span>
          </div>
          <div className="card">
            {stats.muscles.slice(0, 8).map((m) => (
              <div key={m.muscle} className="muscle-bar-row">
                <span className="muscle-bar-label">{m.muscle}</span>
                <div className="muscle-bar-track">
                  <div
                    className="muscle-bar-fill"
                    style={{ width: `${(m.sets / maxMuscleSets) * 100}%` }}
                  />
                </div>
                <span className="muscle-bar-value">{m.sets}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Body weight ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Body weight</h2>
          <button className="section-link" onClick={() => setTargetOpen((o) => !o)}>
            {target ? `Target: ${target}${unit}` : "Set target"}
          </button>
        </div>
        <div className="card">
          {targetOpen && (
            <form onSubmit={saveTarget} style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder={`Target weight (${unit}) — empty to clear`}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                aria-label={`Target body weight in ${unit}`}
                autoFocus
              />
              <button type="submit" className="btn btn--primary">Save</button>
            </form>
          )}

          {targetPct != null && (
            <div style={{ marginBottom: "var(--sp-4)" }}>
              <div className="meter">
                <div className="meter-fill" style={{ width: `${targetPct}%` }} />
              </div>
              <p style={{ color: "var(--text-3)", fontSize: "var(--fs-xs)", marginTop: "var(--sp-1)" }}>
                {current}{unit} now · {Math.abs(Math.round((target - current) * 10) / 10)}{unit} to go
              </p>
            </div>
          )}

          <form onSubmit={addWeight} style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder={`Today's weight (${unit})`}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              aria-label={`Today's body weight in ${unit}`}
            />
            <button type="submit" className="btn btn--primary">
              Log
            </button>
          </form>
          {sortedWeights.length < 2 ? (
            <EmptyState
              icon="trend"
              title={sortedWeights.length === 0 ? "Track your weight" : "One more entry"}
              sub="Log at least two entries to see your trend line."
            />
          ) : (
            <WeightChart data={sortedWeights.slice(-30)} unit={unit} />
          )}
        </div>
      </section>

      {/* ---- Measurements ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Measurements</h2>
        </div>
        <div className="card">
          <form onSubmit={addMeasurement} className="measure-form">
            <select
              className="input"
              value={measurePart}
              onChange={(e) => setMeasurePart(e.target.value)}
              aria-label="Body part"
            >
              {MEASURE_PARTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="cm"
              value={measureValue}
              onChange={(e) => setMeasureValue(e.target.value)}
              aria-label={`${measurePart} measurement in centimetres`}
            />
            <button type="submit" className="btn btn--primary" aria-label="Log measurement">
              <Icon name="plus" size={18} strokeWidth={2.5} />
            </button>
          </form>

          {latestMeasurements.length === 0 ? (
            <EmptyState
              icon="ruler"
              title="No measurements yet"
              sub="Track arms, waist, chest and more — the scale never tells the whole story."
            />
          ) : (
            latestMeasurements.map(({ part, latest, delta }) => (
              <div key={part} className="row">
                <div className="row-main">
                  <div className="row-title">{part}</div>
                  <div className="row-sub">{fmtShort(latest.date)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="pr-weight">{latest.value} cm</div>
                  {delta != null && delta !== 0 && (
                    <div className={`stat-delta ${delta > 0 ? "stat-delta--up" : "stat-delta--down"}`}>
                      {delta > 0 ? "+" : ""}{Math.round(delta * 10) / 10} cm
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---- Workout history ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">History</h2>
          {history.length > 6 && (
            <button className="section-link" onClick={() => setShowAllHistory((s) => !s)}>
              {showAllHistory ? "Show less" : `Show all ${history.length}`}
            </button>
          )}
        </div>
        <div className="card">
          {history.length === 0 ? (
            <EmptyState
              icon="dumbbell"
              title="No workouts yet"
              sub="Every session you finish is stored here forever."
            />
          ) : (
            visibleHistory.map((s) => (
              <button key={s.id} className="row history-row" onClick={() => setOpenSession(s)}>
                <div className="row-main">
                  <div className="row-title">{s.title}</div>
                  <div className="row-sub">
                    {fmtMedium(s.dateKey)} · {fmtDuration(s.finishedAt - s.startedAt)} ·{" "}
                    {formatVolume(sessionVolume(s))}
                  </div>
                </div>
                <span className="badge badge--muted">{sessionSetCount(s)} sets</span>
                <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
              </button>
            ))
          )}
        </div>
      </section>

      {/* ---- Goals ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Goals</h2>
          {goals.length > 0 && (
            <span className="badge badge--accent">
              {doneGoals}/{goals.length}
            </span>
          )}
        </div>
        <div className="card">
          <form onSubmit={addGoal} style={{ display: "flex", gap: "var(--sp-2)" }}>
            <input
              className="input"
              placeholder="e.g. Squat 100kg for 5 reps"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              aria-label="New goal"
            />
            <button type="submit" className="btn btn--primary" aria-label="Add goal">
              <Icon name="plus" size={18} strokeWidth={2.5} />
            </button>
          </form>

          {goals.length > 0 && (
            <>
              <div className="meter" style={{ margin: "var(--sp-4) 0 var(--sp-2)" }}>
                <div
                  className="meter-fill"
                  style={{ width: `${goals.length ? (doneGoals / goals.length) * 100 : 0}%` }}
                />
              </div>
              {goals.map((goal) => (
                <div key={goal.id} className="row">
                  <button
                    className={`goal-check${goal.done ? " done" : ""}`}
                    onClick={() => toggleGoal(goal.id)}
                    aria-label={`Mark "${goal.text}" ${goal.done ? "active" : "achieved"}`}
                    aria-pressed={goal.done}
                  >
                    <Icon name="check" size={15} strokeWidth={3} />
                  </button>
                  <div className="row-main">
                    <div className={`goal-text${goal.done ? " done" : ""}`}>{goal.text}</div>
                  </div>
                  <button
                    className="icon-btn icon-btn--danger"
                    onClick={() => deleteGoal(goal.id)}
                    aria-label={`Delete goal: ${goal.text}`}
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {openSession && (
        <SessionSheet
          session={openSession}
          unit={unit}
          onRepeat={repeatSession}
          onDelete={deleteSession}
          onClose={() => setOpenSession(null)}
        />
      )}
    </main>
  );
}
