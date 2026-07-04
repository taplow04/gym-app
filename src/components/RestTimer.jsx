import { useEffect, useState } from "react";

// Floating rest countdown with a progress ring. Driven by an absolute
// end timestamp so it stays honest if the tab sleeps mid-rest.

const R = 18;
const CIRC = 2 * Math.PI * R;

export default function RestTimer({ endsAt, total, onExtend, onSkip, onDone }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remainingMs = endsAt - now;

  useEffect(() => {
    if (remainingMs <= 0) {
      if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
      onDone();
    }
  }, [remainingMs <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (remainingMs <= 0) return null;

  const sec = Math.ceil(remainingMs / 1000);
  const frac = Math.min(1, remainingMs / (total * 1000));
  const mm = Math.floor(sec / 60);
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <div className="rest-bar" role="timer" aria-label={`Rest: ${sec} seconds remaining`}>
      <div className="rest-ring">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={R} fill="none" stroke="var(--heat-1)" strokeWidth="4" />
          <circle
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - frac)}
          />
        </svg>
        <span className="rest-ring-time">{sec}</span>
      </div>
      <div className="rest-label">
        <span className="overline">Resting</span>
        <span className="rest-time-big">{mm}:{ss}</span>
      </div>
      <button className="btn btn--secondary" onClick={onExtend}>+15s</button>
      <button className="btn btn--ghost" onClick={onSkip}>Skip</button>
    </div>
  );
}
