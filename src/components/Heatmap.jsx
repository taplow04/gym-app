import { useEffect, useMemo, useRef } from "react";
import { dateKey, addDays, startOfWeek, fmtShort, todayKey } from "../lib/dates";
import { heatLevel } from "../lib/stats";

// GitHub-style activity heatmap. Columns = weeks (Mon-first),
// sequential volt ramp carries magnitude; numbers live in the
// cell tooltips (the relief channel for the near-surface steps).

const WEEKS = 18;

export default function Heatmap({ setsByDay }) {
  const scrollRef = useRef(null);

  const grid = useMemo(() => {
    const firstMonday = addDays(startOfWeek(new Date()), -(WEEKS - 1) * 7);
    const today = todayKey();
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const key = dateKey(addDays(firstMonday, w * 7 + d));
        const sets = setsByDay.get(key) || 0;
        return { key, sets, future: key > today };
      })
    );
  }, [setsByDay]);

  // Land on the most recent weeks
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <>
      <div
        className="heatmap-scroll"
        ref={scrollRef}
        role="img"
        aria-label={`Workout activity for the last ${WEEKS} weeks`}
      >
        <div className="heatmap">
          {grid.map((week, w) => (
            <div key={w} className="heatmap-col">
              {week.map((cell) =>
                cell.future ? (
                  <span key={cell.key} className="heatmap-cell" style={{ opacity: 0 }} />
                ) : (
                  <span
                    key={cell.key}
                    className="heatmap-cell"
                    data-level={heatLevel(cell.sets)}
                    title={`${fmtShort(cell.key)}: ${cell.sets} set${cell.sets === 1 ? "" : "s"}`}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend" aria-hidden="true">
        Less
        {[0, 1, 2, 3, 4, 5].map((l) => (
          <span key={l} className="heatmap-cell" data-level={l} />
        ))}
        More
      </div>
    </>
  );
}
