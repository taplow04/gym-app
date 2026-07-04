import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { DEFAULT_PLAN, DAY_NAMES } from "../data/defaultPlan";
import { getExercise } from "../data/exercises";
import { weekdayIndex } from "../lib/dates";
import Icon from "../components/Icon";
import ExercisePicker from "../components/ExercisePicker";
import EmptyState from "../components/EmptyState";
import { useToast } from "../components/Toast";

// Weekly split editor: rename a day's focus, add/remove exercises,
// toggle rest days. Today's card starts expanded.

export default function Plan() {
  const [plan, setPlan] = useLocalStorage("plan", DEFAULT_PLAN);
  const todayIdx = weekdayIndex();
  const [openIdx, setOpenIdx] = useState(todayIdx);
  const [pickerFor, setPickerFor] = useState(null); // day index
  const toast = useToast();

  const updateDay = (idx, patch) => {
    setPlan((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const addExercise = (idx, ex) => {
    if (plan[idx].exercises.includes(ex.id)) {
      toast("Already in this day", "info");
      return;
    }
    updateDay(idx, { exercises: [...plan[idx].exercises, ex.id] });
    toast(`${ex.name} added`, "success");
  };

  const removeExercise = (idx, exId) => {
    updateDay(idx, { exercises: plan[idx].exercises.filter((id) => id !== exId) });
  };

  return (
    <main className="page">
      <h1 className="page-title">Weekly plan</h1>

      {plan.map((day, i) => {
        const open = openIdx === i;
        return (
          <section key={DAY_NAMES[i]} className={`card plan-day${i === todayIdx ? " is-today" : ""}`}>
            <button
              className="plan-day-head"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
            >
              <span className="plan-day-dow">{DAY_NAMES[i].slice(0, 3)}</span>
              <span className="row-main">
                <span className="row-title">{day.rest ? "Rest day" : day.focus}</span>
                <span className="row-sub">
                  {day.rest
                    ? "Recovery"
                    : `${day.exercises.length} exercise${day.exercises.length === 1 ? "" : "s"}`}
                  {i === todayIdx ? " · Today" : ""}
                </span>
              </span>
              <Icon name="chevron-down" size={20} className={`chevron${open ? " open" : ""}`} />
            </button>

            {open && (
              <div className="plan-day-body">
                <div className="field" style={{ marginTop: "var(--sp-3)" }}>
                  <label className="field-label" htmlFor={`focus-${i}`}>
                    Day name
                  </label>
                  <input
                    id={`focus-${i}`}
                    className="input"
                    value={day.focus}
                    onChange={(e) => updateDay(i, { focus: e.target.value })}
                    placeholder="e.g. Push Day"
                  />
                </div>

                <button
                  className="chip"
                  aria-pressed={day.rest}
                  onClick={() => updateDay(i, { rest: !day.rest })}
                  style={{ marginBottom: "var(--sp-3)" }}
                >
                  <Icon name="clock" size={15} /> Rest day
                </button>

                {!day.rest && (
                  <>
                    {day.exercises.length === 0 ? (
                      <EmptyState
                        icon="dumbbell"
                        title="No exercises yet"
                        sub="Build this day from the exercise library."
                      />
                    ) : (
                      day.exercises.map((exId) => {
                        const ex = getExercise(exId);
                        if (!ex) return null;
                        return (
                          <div key={exId} className="row">
                            <div className="row-main">
                              <div className="row-title">{ex.name}</div>
                              <div className="row-sub">{ex.muscle}</div>
                            </div>
                            <button
                              className="icon-btn icon-btn--danger"
                              onClick={() => removeExercise(i, exId)}
                              aria-label={`Remove ${ex.name}`}
                            >
                              <Icon name="x" size={18} />
                            </button>
                          </div>
                        );
                      })
                    )}
                    <button
                      className="btn btn--secondary btn--full"
                      style={{ marginTop: "var(--sp-3)" }}
                      onClick={() => setPickerFor(i)}
                    >
                      <Icon name="plus" size={17} /> Add exercise
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}

      {pickerFor != null && (
        <ExercisePicker
          selectedIds={plan[pickerFor].exercises}
          onPick={(ex) => addExercise(pickerFor, ex)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </main>
  );
}
