import { useMemo, useState } from "react";
import Sheet from "./Sheet";
import Icon from "./Icon";
import EmptyState from "./EmptyState";
import useLocalStorage from "../hooks/useLocalStorage";
import { EXERCISES, MUSCLES, EQUIPMENT } from "../data/exercises";

// Fast, mobile-first exercise browser: alias-aware search, muscle +
// equipment filters, favorites, recently used, and a tap-through detail
// view — all inside the one bottom sheet.

function ExerciseDetail({ ex, added, onPick, onBack }) {
  return (
    <div>
      <button className="btn btn--ghost" onClick={onBack} style={{ marginBottom: "var(--sp-3)" }}>
        <Icon name="arrow-left" size={16} /> All exercises
      </button>

      <h3 className="detail-title">{ex.name}</h3>
      {ex.aliases.length > 0 && (
        <p className="detail-aka">Also known as: {ex.aliases.join(", ")}</p>
      )}

      <div className="chip-row" style={{ marginBottom: "var(--sp-4)" }}>
        <span className="badge badge--accent">{ex.muscle}</span>
        {ex.secondary.map((m) => (
          <span key={m} className="badge badge--muted">{m}</span>
        ))}
      </div>

      <div className="detail-grid">
        <div className="stat-tile">
          <span className="stat-label">Equipment</span>
          <span className="detail-tile-value">{ex.equipment}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Level</span>
          <span className="detail-tile-value" style={{ textTransform: "capitalize" }}>{ex.difficulty}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Type</span>
          <span className="detail-tile-value" style={{ textTransform: "capitalize" }}>{ex.mechanics}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Reps</span>
          <span className="detail-tile-value">{ex.repRange}</span>
        </div>
      </div>

      {ex.desc && <p className="detail-desc">{ex.desc}</p>}

      {ex.steps.length > 0 && (
        <div className="detail-block">
          <h4 className="detail-block-title">How to do it</h4>
          <ol className="detail-steps">
            {ex.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      {ex.mistakes.length > 0 && (
        <div className="detail-block">
          <h4 className="detail-block-title detail-block-title--warn">Common mistakes</h4>
          <ul className="detail-list">
            {ex.mistakes.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {ex.tips.length > 0 && (
        <div className="detail-block">
          <h4 className="detail-block-title detail-block-title--tip">Tips</h4>
          <ul className="detail-list">
            {ex.tips.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      <p className="detail-rest">
        Suggested rest: {ex.restSec >= 60 ? `${Math.floor(ex.restSec / 60)}m${ex.restSec % 60 ? ` ${ex.restSec % 60}s` : ""}` : `${ex.restSec}s`} between sets
      </p>

      <button className="btn btn--primary btn--full btn--lg" onClick={() => onPick(ex)}>
        <Icon name={added ? "check" : "plus"} size={18} /> {added ? "Added — add again" : "Add to workout"}
      </button>
    </div>
  );
}

export default function ExercisePicker({ onPick, selectedIds = [], onClose }) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(null);
  const [equip, setEquip] = useState(null);
  const [detail, setDetail] = useState(null); // exercise being inspected
  const [favIds, setFavIds] = useLocalStorage("favExercises", []);
  const [history] = useLocalStorage("history", []);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const favs = useMemo(() => new Set(favIds), [favIds]);

  // Most recently used exercise ids, newest first.
  const recentIds = useMemo(() => {
    const seen = [];
    for (const session of history) {
      for (const entry of session.entries) {
        if (!seen.includes(entry.exId)) seen.push(entry.exId);
        if (seen.length >= 8) return seen;
      }
    }
    return seen;
  }, [history]);

  const filtering = query.trim() !== "" || muscle || equip;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (ex) =>
        (!muscle || ex.muscle === muscle) &&
        (!equip || ex.equipment === equip) &&
        (!q ||
          ex.name.toLowerCase().includes(q) ||
          ex.muscle.toLowerCase().includes(q) ||
          ex.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }, [query, muscle, equip]);

  const toggleFav = (id) =>
    setFavIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const renderRow = (ex) => {
    const added = selected.has(ex.id);
    const isFav = favs.has(ex.id);
    return (
      <div key={ex.id} className="row picker-row">
        <button className="row-main picker-row-main" onClick={() => setDetail(ex)}>
          <span className="row-title">{ex.name}</span>
          <span className="row-sub">
            {ex.muscle} · {ex.equipment}
          </span>
        </button>
        <button
          className={`icon-btn picker-fav${isFav ? " is-fav" : ""}`}
          onClick={() => toggleFav(ex.id)}
          aria-label={isFav ? `Remove ${ex.name} from favorites` : `Add ${ex.name} to favorites`}
          aria-pressed={isFav}
        >
          <Icon name="star" size={18} strokeWidth={2} />
        </button>
        <button
          className={`icon-btn picker-add${added ? " added" : ""}`}
          onClick={() => onPick(ex)}
          aria-label={added ? `${ex.name} added — add again` : `Add ${ex.name}`}
        >
          <Icon name={added ? "check" : "plus"} size={20} strokeWidth={2.5} />
        </button>
      </div>
    );
  };

  const sectionFor = (title, list) =>
    list.length > 0 && (
      <div key={title}>
        <div className="picker-section">{title}</div>
        {list.map(renderRow)}
      </div>
    );

  return (
    <Sheet title={detail ? "Exercise" : "Add exercise"} onClose={onClose}>
      {detail ? (
        <ExerciseDetail
          ex={detail}
          added={selected.has(detail.id)}
          onPick={onPick}
          onBack={() => setDetail(null)}
        />
      ) : (
        <>
          <div className="picker-search">
            <Icon name="search" size={18} />
            <input
              className="input"
              type="search"
              placeholder={`Search ${EXERCISES.length} exercises`}
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

          <div className="chip-row chip-row--sub" role="group" aria-label="Filter by equipment">
            {EQUIPMENT.map((eq) => (
              <button
                key={eq}
                className="chip chip--small"
                aria-pressed={equip === eq}
                onClick={() => setEquip(equip === eq ? null : eq)}
              >
                {eq}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "var(--sp-3)" }}>
            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="No exercises found"
                sub="Try a different name or clear the filters."
              />
            ) : filtering ? (
              results.map(renderRow)
            ) : (
              <>
                {sectionFor(
                  "Recent",
                  recentIds.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean)
                )}
                {sectionFor(
                  "Favorites",
                  EXERCISES.filter((e) => favs.has(e.id))
                )}
                {MUSCLES.map((m) =>
                  sectionFor(m, results.filter((e) => e.muscle === m))
                )}
              </>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
