import { useState } from "react";
import useLocalStorage, { readStore, clearStore } from "../hooks/useLocalStorage";
import Icon from "../components/Icon";
import { useToast } from "../components/Toast";

// Local-first profile & settings — replaces the old Register screen.
// No accounts, no passwords, nothing leaves the device.

export default function Profile() {
  const [profile, setProfile] = useLocalStorage("profile", {
    name: "",
    unit: "kg",
    restSec: 90,
  });
  const [history] = useLocalStorage("history", []);
  const [resetArmed, setResetArmed] = useState(false);
  const toast = useToast();

  const update = (patch) => setProfile((prev) => ({ ...prev, ...patch }));

  const exportData = async () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: readStore("profile", {}),
        plan: readStore("plan", []),
        history: readStore("history", []),
        weights: readStore("weights", []),
        goals: readStore("goals", []),
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(payload);
      toast("All data copied to clipboard", "success");
    } catch {
      toast("Couldn't access the clipboard", "danger");
    }
  };

  const resetAll = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 3000);
      return;
    }
    clearStore();
    window.location.reload();
  };

  const initial = (profile.name || "?").trim().charAt(0) || "?";

  return (
    <main className="page">
      <h1 className="page-title">Profile</h1>

      <div className="profile-head">
        <div className="avatar">{initial}</div>
        {history.length > 0 && (
          <span className="badge badge--accent">
            <Icon name="dumbbell" size={13} /> {history.length} workout{history.length === 1 ? "" : "s"} logged
          </span>
        )}
      </div>

      <section className="section">
        <div className="card">
          <div className="field">
            <label className="field-label" htmlFor="profile-name">
              Your name
            </label>
            <input
              id="profile-name"
              className="input"
              value={profile.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="What should we call you?"
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="profile-unit">
              Weight unit
            </label>
            <select
              id="profile-unit"
              className="input"
              value={profile.unit}
              onChange={(e) => update({ unit: e.target.value })}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label" htmlFor="profile-rest">
              Default rest timer
            </label>
            <select
              id="profile-rest"
              className="input"
              value={profile.restSec}
              onChange={(e) => update({ restSec: Number(e.target.value) })}
            >
              <option value={60}>1 minute</option>
              <option value={90}>1 minute 30</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
            </select>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Your data</h2>
        </div>
        <div className="card">
          <p style={{ color: "var(--text-2)", fontSize: "var(--fs-sm)", marginBottom: "var(--sp-4)" }}>
            Everything is stored on this device only — no account, no cloud, no
            tracking. Export a backup any time.
          </p>
          <button className="btn btn--secondary btn--full" onClick={exportData}>
            <Icon name="download" size={17} /> Copy backup to clipboard
          </button>
          <button
            className={`btn btn--full ${resetArmed ? "btn--danger" : "btn--ghost"}`}
            style={{ marginTop: "var(--sp-2)" }}
            onClick={resetAll}
          >
            <Icon name="reset" size={17} />
            {resetArmed ? "Tap again to erase everything" : "Reset all data"}
          </button>
        </div>
      </section>

      <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "var(--fs-xs)" }}>
        Forge · built with React
      </p>
    </main>
  );
}
