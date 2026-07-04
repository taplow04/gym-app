import { useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  bestSets,
  weekStreak,
  thisWeekSessions,
  setsPerDay,
  sessionVolume,
  formatVolume,
} from "../lib/stats";
import { todayKey, fmtShort } from "../lib/dates";
import Icon from "../components/Icon";
import Heatmap from "../components/Heatmap";
import WeightChart from "../components/WeightChart";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/Toast";

export default function Progress() {
  const [history] = useLocalStorage("history", []);
  const [weights, setWeights] = useLocalStorage("weights", []);
  const [goals, setGoals] = useLocalStorage("goals", []);
  const [profile] = useLocalStorage("profile", { name: "", unit: "kg", restSec: 90 });
  const [weightInput, setWeightInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const toast = useToast();
  const unit = profile.unit || "kg";

  const stats = useMemo(() => {
    const totalVolume = history.reduce((sum, s) => sum + sessionVolume(s), 0);
    return {
      total: history.length,
      week: thisWeekSessions(history).length,
      streak: weekStreak(history),
      volume: totalVolume,
      byDay: setsPerDay(history),
      prs: [...bestSets(history).values()].sort((a, b) => b.est - a.est),
    };
  }, [history]);

  const sortedWeights = useMemo(
    () => [...weights].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [weights]
  );

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
            <span className="stat-sub">sessions</span>
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

      {/* ---- Body weight ---- */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Body weight</h2>
        </div>
        <div className="card">
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
    </main>
  );
}
