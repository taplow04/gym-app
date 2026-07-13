import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { DEFAULT_PLAN, DAY_NAMES } from "../data/defaultPlan";
import { getExercise } from "../data/exercises";
import { todayKey, weekdayIndex, fmtDuration, fmtClock } from "../lib/dates";
import { sessionVolume, sessionSetCount, detectPRs, formatVolume } from "../lib/stats";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import ExercisePicker from "../components/ExercisePicker";
import RestTimer from "../components/RestTimer";
import Sheet from "../components/Sheet";
import { fmtShort } from "../lib/dates";
import { useToast } from "../components/Toast";

const makeSet = (from) => ({
  weight: from ? from.weight : "",
  reps: from ? from.reps : "",
  done: false,
});

// Set-type cycle: working → warm-up → drop → working.
const NEXT_TYPE = { undefined: "w", w: "d", d: undefined };
const TYPE_LABEL = { w: "W", d: "D" };

/** Past performances of one exercise — opened from the exercise name. */
function ExerciseHistorySheet({ exId, name, unit, history, onClose }) {
  const appearances = [];
  for (const session of history) {
    for (const entry of session.entries) {
      if (entry.exId !== exId) continue;
      const done = entry.sets.filter((s) => s.done);
      if (done.length > 0) appearances.push({ dateKey: session.dateKey, sets: done });
      break;
    }
    if (appearances.length >= 6) break;
  }
  return (
    <Sheet title={name} onClose={onClose}>
      {appearances.length === 0 ? (
        <EmptyState
          icon="clock"
          title="No history yet"
          sub="Finish sets of this exercise and they'll show up here."
        />
      ) : (
        appearances.map((a) => (
          <div key={a.dateKey} className="row">
            <div className="row-main">
              <div className="row-title">{fmtShort(a.dateKey)}</div>
              <div className="row-sub">
                {a.sets.map((s, i) => (
                  <span key={i}>
                    {i > 0 && " · "}
                    {s.type === "w" ? "W " : ""}{s.weight || 0}{unit}×{s.reps}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </Sheet>
  );
}

const makeEntry = (ex) => ({
  exId: ex.id,
  name: ex.name,
  muscle: ex.muscle,
  sets: [makeSet(), makeSet(), makeSet()],
});

/** Isolated ticking clock so the page doesn't re-render every second */
function SessionClock({ startedAt }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="session-clock">{fmtClock(now - startedAt)}</span>;
}

const CONFETTI_COLORS = ["var(--accent)", "var(--success)", "var(--warning)", "#7dd3fc"];

function Celebration({ session, prs, onClose }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 9) * 0.14}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  return (
    <div className="celebrate">
      {confetti.map((c, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: c.left, animationDelay: c.delay, background: c.color }}
          aria-hidden="true"
        />
      ))}
      <div className="celebrate-trophy">
        <Icon name="trophy" size={40} strokeWidth={1.8} />
      </div>
      <h1 className="celebrate-title">Workout complete!</h1>
      <p style={{ color: "var(--text-2)" }}>{session.title}</p>

      <div className="celebrate-stats">
        <div className="stat-tile">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{fmtDuration(session.finishedAt - session.startedAt)}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Volume</span>
          <span className="stat-value">{formatVolume(sessionVolume(session))}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Sets</span>
          <span className="stat-value">{sessionSetCount(session)}</span>
        </div>
      </div>

      {prs.length > 0 && (
        <div>
          {prs.map((pr) => (
            <div key={pr.exId} className="celebrate-pr">
              <Icon name="trophy" size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> New PR —{" "}
              {pr.name}: {pr.weight}×{pr.reps}
            </div>
          ))}
        </div>
      )}

      <button className="btn btn--primary btn--lg" onClick={onClose}>
        Done
      </button>
    </div>
  );
}

export default function Workout() {
  const [active, setActive] = useLocalStorage("activeSession", null);
  const [history, setHistory] = useLocalStorage("history", []);
  const [plan] = useLocalStorage("plan", DEFAULT_PLAN);
  const [profile] = useLocalStorage("profile", { name: "", unit: "kg", restSec: 90 });
  const [templates, setTemplates] = useLocalStorage("templates", []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rest, setRest] = useState(null); // { endsAt, total }
  const [summary, setSummary] = useState(null); // { session, prs }
  const [discardArmed, setDiscardArmed] = useState(false);
  const [historyFor, setHistoryFor] = useState(null); // { exId, name }
  const [noteOpen, setNoteOpen] = useState({}); // entry index → bool
  const toast = useToast();
  const navigate = useNavigate();

  const todayIdx = weekdayIndex();
  const unit = profile.unit || "kg";
  const restSec = profile.restSec || 90;

  // exId → most recent session's completed sets, for the PREV column
  const prevSets = useMemo(() => {
    const map = new Map();
    for (const session of history) {
      for (const entry of session.entries) {
        if (!map.has(entry.exId)) {
          const done = entry.sets.filter((s) => s.done);
          if (done.length > 0) map.set(entry.exId, done);
        }
      }
    }
    return map;
  }, [history]);

  const startSession = (dayIdx) => {
    const fromPlan = dayIdx != null;
    const exercises = fromPlan
      ? plan[dayIdx].exercises.map(getExercise).filter(Boolean)
      : [];
    setActive({
      id: Date.now(),
      dateKey: todayKey(),
      title: fromPlan ? plan[dayIdx].focus : "Custom Workout",
      startedAt: Date.now(),
      entries: exercises.map(makeEntry),
    });
  };

  const updateSet = (ei, si, field, value) => {
    setActive((prev) => {
      const entries = prev.entries.map((entry, i) =>
        i !== ei
          ? entry
          : {
              ...entry,
              sets: entry.sets.map((set, j) => (j !== si ? set : { ...set, [field]: value })),
            }
      );
      return { ...prev, entries };
    });
  };

  const toggleDone = (ei, si) => {
    const set = active.entries[ei].sets[si];
    if (!set.done) {
      if (!(Number(set.reps) > 0)) {
        toast("Enter reps before completing the set", "danger");
        return;
      }
      setRest({ endsAt: Date.now() + restSec * 1000, total: restSec });
      if (navigator.vibrate) navigator.vibrate(30);
    }
    updateSet(ei, si, "done", !set.done);
  };

  const cycleSetType = (ei, si) => {
    const current = active.entries[ei].sets[si].type;
    updateSet(ei, si, "type", NEXT_TYPE[current]);
  };

  const updateNote = (ei, note) => {
    setActive((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) => (i === ei ? { ...entry, note } : entry)),
    }));
  };

  const saveTemplate = () => {
    const exIds = active.entries.map((e) => e.exId);
    if (exIds.length === 0) {
      toast("Add exercises before saving a template", "danger");
      return;
    }
    const base = active.title || "My workout";
    const names = new Set(templates.map((t) => t.name));
    let name = base;
    for (let n = 2; names.has(name); n++) name = `${base} (${n})`;
    setTemplates((prev) => [...prev, { id: Date.now(), name, exIds }]);
    toast(`Template "${name}" saved`, "success");
  };

  const startTemplate = (t) => {
    const exercises = t.exIds.map(getExercise).filter(Boolean);
    setActive({
      id: Date.now(),
      dateKey: todayKey(),
      title: t.name,
      startedAt: Date.now(),
      entries: exercises.map(makeEntry),
    });
  };

  const deleteTemplate = (id) => setTemplates((prev) => prev.filter((t) => t.id !== id));

  const addSet = (ei) => {
    setActive((prev) => {
      const entries = prev.entries.map((entry, i) => {
        if (i !== ei) return entry;
        const last = entry.sets[entry.sets.length - 1];
        return { ...entry, sets: [...entry.sets, makeSet(last)] };
      });
      return { ...prev, entries };
    });
  };

  const removeEntry = (ei) => {
    setActive((prev) => ({ ...prev, entries: prev.entries.filter((_, i) => i !== ei) }));
  };

  const addExercise = (ex) => {
    if (active.entries.some((e) => e.exId === ex.id)) {
      toast("Already in this workout", "info");
      return;
    }
    setActive((prev) => ({ ...prev, entries: [...prev.entries, makeEntry(ex)] }));
    toast(`${ex.name} added`, "success");
  };

  const finishSession = () => {
    const cleaned = active.entries
      .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
      .filter((e) => e.sets.length > 0);
    if (cleaned.length === 0) {
      toast("Complete at least one set first", "danger");
      return;
    }
    const session = { ...active, finishedAt: Date.now(), entries: cleaned };
    const prs = detectPRs(session, history);
    setHistory((prev) => [session, ...prev]);
    setActive(null);
    setRest(null);
    setSummary({ session, prs });
  };

  const discardSession = () => {
    if (!discardArmed) {
      setDiscardArmed(true);
      setTimeout(() => setDiscardArmed(false), 3000);
      return;
    }
    setActive(null);
    setRest(null);
    setDiscardArmed(false);
    toast("Workout discarded", "info");
  };

  /* ---------- Post-workout celebration ---------- */
  if (summary) {
    return (
      <Celebration
        session={summary.session}
        prs={summary.prs}
        onClose={() => {
          setSummary(null);
          navigate("/");
        }}
      />
    );
  }

  /* ---------- No active session: start screen ---------- */
  if (!active) {
    const today = plan[todayIdx];
    return (
      <main className="page">
        <h1 className="page-title">Start training</h1>

        {!today.rest && (
          <section className="section">
            <div className="card card--accent today-card">
              <span className="overline">Today · {DAY_NAMES[todayIdx]}</span>
              <h2 className="today-focus">{today.focus}</h2>
              <div className="today-meta">
                <span>
                  <Icon name="dumbbell" size={15} /> {today.exercises.length} exercises
                </span>
              </div>
              <button className="btn btn--primary btn--lg btn--full" onClick={() => startSession(todayIdx)}>
                <Icon name="play" size={18} /> Start today&apos;s workout
              </button>
            </div>
          </section>
        )}

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Or pick a day</h2>
          </div>
          <div className="card">
            {plan.map((day, i) =>
              day.rest || i === todayIdx ? null : (
                <div key={DAY_NAMES[i]} className="row">
                  <div className="row-main">
                    <div className="row-title">{day.focus}</div>
                    <div className="row-sub">
                      {DAY_NAMES[i]} · {day.exercises.length} exercises
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => startSession(i)} aria-label={`Start ${day.focus}`}>
                    <Icon name="play" size={20} />
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        {templates.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">Templates</h2>
            </div>
            <div className="card">
              {templates.map((t) => (
                <div key={t.id} className="row">
                  <div className="row-main">
                    <div className="row-title">{t.name}</div>
                    <div className="row-sub">{t.exIds.length} exercises</div>
                  </div>
                  <button
                    className="icon-btn icon-btn--danger"
                    onClick={() => deleteTemplate(t.id)}
                    aria-label={`Delete template ${t.name}`}
                  >
                    <Icon name="trash" size={17} />
                  </button>
                  <button className="icon-btn" onClick={() => startTemplate(t)} aria-label={`Start ${t.name}`}>
                    <Icon name="play" size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button className="btn btn--secondary btn--lg btn--full" onClick={() => startSession(null)}>
          <Icon name="plus" size={18} /> Start empty workout
        </button>
      </main>
    );
  }

  /* ---------- Active session ---------- */
  return (
    <main className="page">
      <div className="session-bar">
        <div>
          <span className="session-clock-label">{active.title}</span>
          <br />
          <SessionClock startedAt={active.startedAt} />
        </div>
        <div style={{ display: "flex", gap: "var(--sp-2)" }}>
          <button className={`btn ${discardArmed ? "btn--danger" : "btn--ghost"}`} onClick={discardSession}>
            {discardArmed ? "Sure?" : "Discard"}
          </button>
          <button className="btn btn--primary" onClick={finishSession}>
            Finish
          </button>
        </div>
      </div>

      {active.entries.length === 0 && (
        <EmptyState
          icon="dumbbell"
          title="Empty workout"
          sub="Add your first exercise to start logging sets."
        />
      )}

      {active.entries.map((entry, ei) => {
        const prev = prevSets.get(entry.exId) || [];
        return (
          <section key={`${entry.exId}-${ei}`} className="card exercise-card">
            <div className="exercise-head">
              <button
                className="exercise-name exercise-name--btn"
                onClick={() => setHistoryFor({ exId: entry.exId, name: entry.name })}
                aria-label={`Show history for ${entry.name}`}
              >
                {entry.name}
              </button>
              <span className="badge badge--muted">{entry.muscle}</span>
              <button
                className={`icon-btn${noteOpen[ei] || entry.note ? " icon-btn--active" : ""}`}
                onClick={() => setNoteOpen((o) => ({ ...o, [ei]: !o[ei] }))}
                aria-label={`${noteOpen[ei] ? "Hide" : "Show"} note for ${entry.name}`}
                aria-pressed={Boolean(noteOpen[ei])}
              >
                <Icon name="edit" size={17} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => removeEntry(ei)}
                aria-label={`Remove ${entry.name}`}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>

            {(noteOpen[ei] || entry.note) && (
              <input
                className="input exercise-note"
                placeholder="Note — e.g. seat height 4, pause reps"
                value={entry.note || ""}
                onChange={(e) => updateNote(ei, e.target.value)}
                aria-label={`Note for ${entry.name}`}
              />
            )}

            <div className="set-grid" aria-hidden="true">
              <span className="set-grid-head">Set</span>
              <span className="set-grid-head">Prev</span>
              <span className="set-grid-head">{unit}</span>
              <span className="set-grid-head">Reps</span>
              <span className="set-grid-head">✓</span>
            </div>

            {entry.sets.map((set, si) => {
              const p = prev[si];
              return (
                <div key={si} className={`set-grid${set.done ? " done" : ""}`}>
                  <button
                    className={`set-index set-index--btn${set.type ? ` set-index--${set.type}` : ""}`}
                    onClick={() => cycleSetType(ei, si)}
                    aria-label={`Set ${si + 1} type: ${
                      set.type === "w" ? "warm-up" : set.type === "d" ? "drop set" : "working set"
                    } — tap to change`}
                  >
                    {TYPE_LABEL[set.type] || si + 1}
                  </button>
                  <span className="set-prev">{p ? `${p.weight || 0}×${p.reps}` : "—"}</span>
                  <input
                    className="input input--num"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder={p ? String(p.weight) : "0"}
                    value={set.weight}
                    onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                    aria-label={`Set ${si + 1} weight (${unit})`}
                  />
                  <input
                    className="input input--num"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder={p ? String(p.reps) : "0"}
                    value={set.reps}
                    onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                    aria-label={`Set ${si + 1} reps`}
                  />
                  <button
                    className="set-check"
                    onClick={() => toggleDone(ei, si)}
                    aria-label={`Mark set ${si + 1} ${set.done ? "not done" : "done"}`}
                    aria-pressed={set.done}
                  >
                    <Icon name="check" size={18} strokeWidth={3} />
                  </button>
                </div>
              );
            })}

            <button className="add-set-btn" onClick={() => addSet(ei)}>
              <Icon name="plus" size={15} strokeWidth={2.5} /> Add set
            </button>
          </section>
        );
      })}

      <button className="btn btn--secondary btn--lg btn--full" onClick={() => setPickerOpen(true)}>
        <Icon name="plus" size={18} /> Add exercise
      </button>

      {active.entries.length > 0 && (
        <button
          className="btn btn--ghost btn--full"
          style={{ marginTop: "var(--sp-2)" }}
          onClick={saveTemplate}
        >
          <Icon name="bookmark" size={17} /> Save as template
        </button>
      )}

      <p className="set-type-hint">
        Tap a set number to mark it <strong>W</strong>arm-up or <strong>D</strong>rop set —
        warm-ups don&rsquo;t count toward volume or PRs.
      </p>

      {pickerOpen && (
        <ExercisePicker
          selectedIds={active.entries.map((e) => e.exId)}
          onPick={addExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {historyFor && (
        <ExerciseHistorySheet
          exId={historyFor.exId}
          name={historyFor.name}
          unit={unit}
          history={history}
          onClose={() => setHistoryFor(null)}
        />
      )}

      {rest && (
        <RestTimer
          endsAt={rest.endsAt}
          total={rest.total}
          onExtend={() => setRest((r) => ({ endsAt: r.endsAt + 15000, total: r.total + 15 }))}
          onSkip={() => setRest(null)}
          onDone={() => setRest(null)}
        />
      )}
    </main>
  );
}
