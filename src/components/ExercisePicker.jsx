import { useMemo, useState } from "react";
import Sheet from "./Sheet";
import Icon from "./Icon";
import EmptyState from "./EmptyState";
import { EXERCISES, MUSCLES } from "../data/exercises";

// Searchable exercise library with muscle-group filter chips.
// Used by both the Plan builder and a live workout session.

export default function ExercisePicker({ onPick, selectedIds = [], onClose }) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(null);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (ex) =>
        (!muscle || ex.muscle === muscle) &&
        (!q || ex.name.toLowerCase().includes(q))
    );
  }, [query, muscle]);

  return (
    <Sheet title="Add exercise" onClose={onClose}>
      <div className="picker-search">
        <Icon name="search" size={18} />
        <input
          className="input"
          type="search"
          placeholder="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
          autoFocus
        />
      </div>

      <div className="chip-row" role="group" aria-label="Filter by muscle group">
        {MUSCLES.map((m) => (
          <button
            key={m}
            className="chip"
            aria-pressed={muscle === m}
            onClick={() => setMuscle(muscle === m ? null : m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "var(--sp-3)" }}>
        {results.length === 0 ? (
          <EmptyState icon="search" title="No exercises found" sub="Try a different name or clear the muscle filter." />
        ) : (
          results.map((ex) => {
            const added = selected.has(ex.id);
            return (
              <div key={ex.id} className="row">
                <div className="row-main">
                  <div className="row-title">{ex.name}</div>
                  <div className="row-sub">{ex.muscle}</div>
                </div>
                <button
                  className={`icon-btn picker-add${added ? " added" : ""}`}
                  onClick={() => onPick(ex)}
                  aria-label={added ? `${ex.name} added — add again` : `Add ${ex.name}`}
                >
                  <Icon name={added ? "check" : "plus"} size={20} strokeWidth={2.5} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </Sheet>
  );
}
