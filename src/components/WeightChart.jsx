import { useMemo, useRef, useState } from "react";
import { fmtShort } from "../lib/dates";

// Single-series body-weight line: 2px line, 10% area wash, hairline
// gridlines, surface-ringed end dot, endpoint direct label, and a
// crosshair + tooltip hover layer. One axis; no legend (single series).

const W = 600;
const H = 200;
const PAD = { l: 40, r: 46, t: 14, b: 26 };

export default function WeightChart({ data, unit }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null); // point index

  const model = useMemo(() => {
    const pts = data.map((d) => ({ ...d, w: Number(d.weight) }));
    let min = Math.min(...pts.map((p) => p.w));
    let max = Math.max(...pts.map((p) => p.w));
    if (min === max) {
      min -= 2;
      max += 2;
    }
    const span = max - min;
    min -= span * 0.15;
    max += span * 0.15;

    const x = (i) => PAD.l + (i / Math.max(1, pts.length - 1)) * (W - PAD.l - PAD.r);
    const y = (w) => PAD.t + (1 - (w - min) / (max - min)) * (H - PAD.t - PAD.b);

    const coords = pts.map((p, i) => ({ ...p, x: x(i), y: y(p.w) }));
    const line = coords.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${coords[coords.length - 1].x.toFixed(1)} ${H - PAD.b} L${coords[0].x.toFixed(1)} ${H - PAD.b} Z`;

    // Three clean horizontal ticks
    const ticks = [0, 0.5, 1].map((f) => {
      const value = Math.round(min + f * (max - min));
      return { value, y: y(value) };
    });

    return { coords, line, area, ticks };
  }, [data]);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    model.coords.forEach((p, i) => {
      const d = Math.abs(p.x - fx);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  const hp = hover != null ? model.coords[hover] : null;
  const last = model.coords[model.coords.length - 1];

  return (
    <div
      className="chart-wrap"
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Body weight trend, currently ${last.w} ${unit}`}>
        {/* hairline grid + ticks */}
        {model.ticks.map((t) => (
          <g key={t.value}>
            <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="var(--grid-line)" strokeWidth="1" />
            <text x={PAD.l - 8} y={t.y + 3.5} textAnchor="end" fontSize="11" fill="var(--text-3)" fontVariant="tabular-nums">
              {t.value}
            </text>
          </g>
        ))}

        {/* x labels: first & last date */}
        <text x={PAD.l} y={H - 8} fontSize="11" fill="var(--text-3)">
          {fmtShort(model.coords[0].date)}
        </text>
        <text x={W - PAD.r} y={H - 8} fontSize="11" fill="var(--text-3)" textAnchor="end">
          {fmtShort(last.date)}
        </text>

        {/* area wash + line */}
        <path d={model.area} fill="var(--accent)" opacity="0.1" />
        <path d={model.line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* crosshair */}
        {hp && (
          <line x1={hp.x} x2={hp.x} y1={PAD.t} y2={H - PAD.b} stroke="var(--border-strong)" strokeWidth="1" />
        )}
        {hp && <circle cx={hp.x} cy={hp.y} r="4.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />}

        {/* end marker + direct label */}
        <circle cx={last.x} cy={last.y} r="4.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
        <text x={last.x + 8} y={last.y + 4} fontSize="12" fontWeight="700" fill="var(--text-1)">
          {last.w}
        </text>
      </svg>

      {hp && (
        <div
          className="chart-tooltip"
          style={{ left: `${(hp.x / W) * 100}%`, top: `${(hp.y / H) * 100 - 6}%` }}
        >
          {hp.w} {unit}
          <small>{fmtShort(hp.date)}</small>
        </div>
      )}
    </div>
  );
}
