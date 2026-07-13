import { useCallback, useEffect, useRef, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Icon from "../components/Icon";

// Premium interval/rest timer. Driven by an absolute end timestamp so it
// stays honest through tab sleeps; wake lock keeps the screen on while
// running; the alarm is synthesized with WebAudio (no asset to load).

const PRESETS = [30, 45, 60, 90, 120, 180, 300];

const fmt = (totalSec) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 2 ? 1320 : 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // No audio available — vibration still fires.
  }
}

const R = 118;
const CIRC = 2 * Math.PI * R;

export default function Timer() {
  const [prefs, setPrefs] = useLocalStorage("timer", {
    duration: 90,
    sound: true,
    repeat: false,
  });
  const [phase, setPhase] = useState("idle"); // idle | running | paused | done
  const [endsAt, setEndsAt] = useState(null);
  const [pausedLeft, setPausedLeft] = useState(null); // ms left when paused
  const [now, setNow] = useState(() => Date.now());
  const wakeLock = useRef(null);

  const duration = prefs.duration;
  const running = phase === "running";

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  // Keep the screen awake while the clock runs.
  useEffect(() => {
    if (running && "wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then((lock) => (wakeLock.current = lock))
        .catch(() => {});
    }
    return () => {
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, [running]);

  const finish = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([220, 100, 220, 100, 320]);
    if (prefs.sound) beep();
    if (prefs.repeat) {
      setEndsAt(Date.now() + duration * 1000);
      setPhase("running");
    } else {
      setPhase("done");
      setEndsAt(null);
    }
  }, [prefs.sound, prefs.repeat, duration]);

  const remainingMs = running ? Math.max(0, endsAt - now) : pausedLeft ?? duration * 1000;

  useEffect(() => {
    if (running && endsAt - now <= 0) finish();
  }, [running, endsAt, now, finish]);

  const start = () => {
    setEndsAt(Date.now() + duration * 1000);
    setPausedLeft(null);
    setPhase("running");
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const pause = () => {
    setPausedLeft(Math.max(0, endsAt - Date.now()));
    setPhase("paused");
  };

  const resume = () => {
    setEndsAt(Date.now() + pausedLeft);
    setPausedLeft(null);
    setPhase("running");
  };

  const reset = () => {
    setPhase("idle");
    setEndsAt(null);
    setPausedLeft(null);
  };

  const setDuration = (sec) => {
    const clamped = Math.min(3600, Math.max(5, sec));
    setPrefs((p) => ({ ...p, duration: clamped }));
    if (phase !== "idle") reset();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const displaySec = phase === "done" ? 0 : Math.ceil(remainingMs / 1000);
  const frac = phase === "idle" ? 1 : phase === "done" ? 0 : remainingMs / (duration * 1000);
  const ending = running && displaySec <= 5;

  return (
    <main className="page timer-page">
      <div className="timer-head">
        <h1 className="page-title" style={{ margin: 0 }}>Timer</h1>
        <div style={{ display: "flex", gap: "var(--sp-2)" }}>
          <button
            className="icon-btn"
            onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
            aria-label={prefs.sound ? "Mute alarm" : "Unmute alarm"}
            aria-pressed={prefs.sound}
          >
            <Icon name={prefs.sound ? "volume" : "volume-off"} size={20} />
          </button>
          <button className="icon-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            <Icon name="maximize" size={20} />
          </button>
        </div>
      </div>

      <div className="timer-layout">
        <div className={`timer-ring-wrap${ending ? " is-ending" : ""}${phase === "done" ? " is-done" : ""}`}>
          <svg className="timer-ring" viewBox="0 0 260 260" role="timer" aria-label={`${fmt(displaySec)} remaining`}>
            <circle cx="130" cy="130" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            <circle
              cx="130"
              cy="130"
              r={R}
              fill="none"
              stroke={phase === "done" ? "var(--success)" : "var(--accent)"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - frac)}
              transform="rotate(-90 130 130)"
              className="timer-ring-progress"
            />
          </svg>
          <div className="timer-center">
            {phase === "done" ? (
              <>
                <span className="timer-done-icon"><Icon name="check" size={40} strokeWidth={2.6} /></span>
                <span className="timer-done-text">Time&rsquo;s up!</span>
              </>
            ) : (
              <>
                <span className={`timer-digits${ending ? " ending" : ""}`}>{fmt(displaySec)}</span>
                <span className="timer-total">of {fmt(duration)}</span>
              </>
            )}
          </div>
        </div>

        <div className="timer-controls">
          {phase === "idle" && (
            <>
              <div className="chip-row timer-presets" role="group" aria-label="Timer presets">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    className={`chip${duration === p ? " chip--active" : ""}`}
                    aria-pressed={duration === p}
                    onClick={() => setDuration(p)}
                  >
                    {p < 60 ? `${p}s` : `${p / 60} min`}
                  </button>
                ))}
              </div>

              <div className="timer-custom">
                <button className="icon-btn timer-step" onClick={() => setDuration(duration - 15)} aria-label="15 seconds less">
                  <Icon name="minus" size={20} strokeWidth={2.5} />
                </button>
                <span className="timer-custom-value">{fmt(duration)}</span>
                <button className="icon-btn timer-step" onClick={() => setDuration(duration + 15)} aria-label="15 seconds more">
                  <Icon name="plus" size={20} strokeWidth={2.5} />
                </button>
              </div>

              <label className="timer-repeat">
                <input
                  type="checkbox"
                  checked={prefs.repeat}
                  onChange={(e) => setPrefs((p) => ({ ...p, repeat: e.target.checked }))}
                />
                <Icon name="repeat" size={16} /> Repeat automatically (intervals)
              </label>

              <button className="btn btn--primary btn--lg btn--full" onClick={start}>
                <Icon name="play" size={18} /> Start
              </button>
            </>
          )}

          {(phase === "running" || phase === "paused") && (
            <div className="timer-actions">
              <button className="btn btn--ghost btn--lg" onClick={reset}>
                <Icon name="reset" size={18} /> Reset
              </button>
              {running ? (
                <button className="btn btn--primary btn--lg timer-main-btn" onClick={pause}>
                  <Icon name="pause" size={18} /> Pause
                </button>
              ) : (
                <button className="btn btn--primary btn--lg timer-main-btn" onClick={resume}>
                  <Icon name="play" size={18} /> Resume
                </button>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="timer-actions">
              <button className="btn btn--secondary btn--lg" onClick={reset}>
                Done
              </button>
              <button className="btn btn--primary btn--lg timer-main-btn" onClick={start}>
                <Icon name="repeat" size={18} /> Go again
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="timer-hint">
        Rest between sets, planks, HIIT rounds, stretching holds — vibrates and
        sounds when time is up.
      </p>
    </main>
  );
}
