import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useLocalStorage, { readStore, clearStore } from "../hooks/useLocalStorage";
import Icon from "../components/Icon";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import PasswordField from "../components/PasswordField";
import { BtnSpinner } from "./auth/AuthLayout";
import { api } from "../lib/api";
import { validatePassword } from "../lib/validate";

// Profile & settings. Local-first settings stay on the device; the
// account card (avatar, verification, password, logout) only appears
// for signed-in users — guests get an upgrade prompt instead.

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MAX_EDGE = 512;

/** Downscale to ≤512px JPEG on a canvas — uploads stay fast on mobile data. */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, AVATAR_MAX_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process the image"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file doesn't look like an image"));
    };
    img.src = url;
  });
}

const ACTIVITY_FACTORS = [
  ["1.2", "Sedentary (desk job)"],
  ["1.375", "Light (1–3 sessions/wk)"],
  ["1.55", "Moderate (3–5 sessions/wk)"],
  ["1.725", "Active (6–7 sessions/wk)"],
  ["1.9", "Very active (physical job)"],
];

/** BMI / BMR (Mifflin-St Jeor) / TDEE / macro calculator — all local. */
function HealthToolkit({ profile, update }) {
  const unit = profile.unit || "kg";
  const heightCm = Number(profile.heightCm) || 0;
  const age = Number(profile.age) || 0;
  const rawWeight = Number(profile.bodyWeight) || 0;
  const weightKg = unit === "lb" ? rawWeight * 0.4536 : rawWeight;
  const gender = profile.gender || "";
  const activity = Number(profile.activity) || 1.55;

  const ready = heightCm > 0 && age > 0 && weightKg > 0;
  let bmi = 0, bmr = 0, tdee = 0, protein = 0, fat = 0, carbs = 0;
  if (ready) {
    bmi = weightKg / Math.pow(heightCm / 100, 2);
    const offset = gender === "male" ? 5 : gender === "female" ? -161 : -78;
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
    tdee = bmr * activity;
    protein = 1.8 * weightKg; // g
    fat = (tdee * 0.25) / 9; // g
    carbs = (tdee - protein * 4 - fat * 9) / 4; // g
  }
  const bmiLabel =
    bmi === 0 ? "" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">Health toolkit</h2>
      </div>
      <div className="card">
        <div className="auth-grid-2">
          <div className="field">
            <label className="field-label" htmlFor="hk-height">Height (cm)</label>
            <input
              id="hk-height"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="175"
              value={profile.heightCm || ""}
              onChange={(e) => update({ heightCm: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="hk-age">Age</label>
            <input
              id="hk-age"
              className="input"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="25"
              value={profile.age || ""}
              onChange={(e) => update({ age: e.target.value })}
            />
          </div>
        </div>
        <div className="auth-grid-2">
          <div className="field">
            <label className="field-label" htmlFor="hk-weight">Weight ({unit})</label>
            <input
              id="hk-weight"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder={unit === "lb" ? "160" : "72"}
              value={profile.bodyWeight || ""}
              onChange={(e) => update({ bodyWeight: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="hk-gender">Gender</label>
            <select
              id="hk-gender"
              className="input"
              value={gender}
              onChange={(e) => update({ gender: e.target.value })}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="hk-activity">Activity level</label>
          <select
            id="hk-activity"
            className="input"
            value={String(activity)}
            onChange={(e) => update({ activity: Number(e.target.value) })}
          >
            {ACTIVITY_FACTORS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {ready ? (
          <>
            <div className="progress-grid" style={{ marginTop: "var(--sp-2)" }}>
              <div className="stat-tile">
                <span className="stat-label">BMI</span>
                <span className="stat-value">{bmi.toFixed(1)}</span>
                <span className="stat-sub">{bmiLabel}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">BMR</span>
                <span className="stat-value">{Math.round(bmr)}</span>
                <span className="stat-sub">kcal at rest</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">TDEE</span>
                <span className="stat-value">{Math.round(tdee)}</span>
                <span className="stat-sub">kcal maintenance</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Protein</span>
                <span className="stat-value">{Math.round(protein)}g</span>
                <span className="stat-sub">daily target</span>
              </div>
            </div>
            <p style={{ color: "var(--text-3)", fontSize: "var(--fs-xs)", marginTop: "var(--sp-3)", lineHeight: 1.5 }}>
              Maintenance macros: ~{Math.round(protein)}g protein · {Math.round(fat)}g fat ·{" "}
              {Math.round(carbs)}g carbs. Eat ~300–500 kcal above TDEE to gain, below to cut.
            </p>
          </>
        ) : (
          <p style={{ color: "var(--text-3)", fontSize: "var(--fs-sm)" }}>
            Fill in height, age and weight to see BMI, calorie and macro targets.
          </p>
        )}
      </div>
    </section>
  );
}

export default function Profile() {
  const { status, user, isAuthed, isGuest, logout, applyUser } = useAuth();
  const [profile, setProfile] = useLocalStorage("profile", {
    name: "",
    unit: "kg",
    restSec: 90,
  });
  const [history] = useLocalStorage("history", []);
  const [resetArmed, setResetArmed] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (patch) => setProfile((prev) => ({ ...prev, ...patch }));

  // ── Avatar upload ──
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      return toast("Use a JPEG, PNG or WebP image", "danger");
    }
    if (file.size > AVATAR_MAX_BYTES) {
      return toast("Image too large — max 5 MB", "danger");
    }
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const preview = URL.createObjectURL(blob);
      setAvatarPreview(preview); // instant feedback while the upload runs
      const form = new FormData();
      form.append("image", blob, "avatar.jpg");
      const res = await api.patch("/users/profile-picture", form, { timeout: 30000 });
      applyUser(res.data.user);
      toast("Profile picture updated", "success");
    } catch (err) {
      setAvatarPreview("");
      toast(err.message, "danger");
    } finally {
      setUploading(false);
    }
  };

  // ── Change password ──
  const [pwOpen, setPwOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    const invalid = validatePassword(pwNew);
    if (invalid) return setPwError(invalid);
    if (pwNew === pwCurrent) {
      return setPwError("New password must be different from the current one");
    }
    setPwSaving(true);
    setPwError("");
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      // The API revokes every session on password change — re-login required.
      await logout();
      toast("Password changed — log in with your new password", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      setPwError(err.fieldError?.("newPassword") || err.message);
      setPwSaving(false);
    }
  };

  // ── Log out ──
  const [loggingOut, setLoggingOut] = useState(false);
  const doLogout = async () => {
    setLoggingOut(true);
    await logout();
    toast("Logged out — your local data stays on this device", "info");
    navigate("/login", { replace: true });
  };

  const exportData = async () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: readStore("profile", {}),
        plan: readStore("plan", []),
        history: readStore("history", []),
        weights: readStore("weights", []),
        goals: readStore("goals", []),
        measurements: readStore("measurements", []),
        water: readStore("water", {}),
        templates: readStore("templates", []),
        favExercises: readStore("favExercises", []),
        timer: readStore("timer", {}),
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

  const displayName = isAuthed ? user?.name : profile.name;
  const initial = (displayName || "?").trim().charAt(0) || "?";
  const avatarUrl = avatarPreview || user?.profilePicture?.url || "";

  return (
    <main className="page">
      <h1 className="page-title">Profile</h1>

      <div className="profile-head">
        <div className="avatar-wrap">
          {avatarUrl ? (
            <img
              className={`avatar-img${uploading ? " avatar-uploading" : ""}`}
              src={avatarUrl}
              alt=""
            />
          ) : (
            <div className={`avatar${uploading ? " avatar-uploading" : ""}`}>{initial}</div>
          )}
          {isAuthed && (
            <>
              <button
                type="button"
                className="avatar-edit"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile picture"
              >
                {uploading ? <BtnSpinner /> : <Icon name="camera" size={17} />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept={AVATAR_TYPES.join(",")}
                onChange={pickAvatar}
                hidden
              />
            </>
          )}
        </div>

        {isAuthed && (
          <div className="account-identity">
            <div className="account-name">{user?.name}</div>
            <div className="account-email">{user?.email}</div>
          </div>
        )}

        {isAuthed &&
          (user?.emailVerified ? (
            <span className="badge badge--success">
              <Icon name="shield" size={13} /> Email verified
            </span>
          ) : (
            <span className="badge badge--muted">
              <Icon name="mail" size={13} /> Email not verified
            </span>
          ))}

        {history.length > 0 && (
          <span className="badge badge--accent">
            <Icon name="dumbbell" size={13} /> {history.length} workout
            {history.length === 1 ? "" : "s"} logged
          </span>
        )}
      </div>

      {/* ── Guest upgrade prompt ── */}
      {isGuest && (
        <section className="section">
          <div className="card card--accent">
            <p
              style={{
                color: "var(--text-2)",
                fontSize: "var(--fs-sm)",
                marginBottom: "var(--sp-4)",
                lineHeight: 1.5,
              }}
            >
              You&rsquo;re training as a <strong style={{ color: "var(--text-1)" }}>guest</strong>.
              Create a free account to secure your profile and unlock cloud features.
            </p>
            <Link to="/signup" className="btn btn--primary btn--full">
              Create free account
            </Link>
            <Link
              to="/login"
              className="btn btn--ghost btn--full"
              style={{ marginTop: "var(--sp-2)" }}
            >
              I already have one — log in
            </Link>
          </div>
        </section>
      )}

      {/* ── Account (signed in) ── */}
      {isAuthed && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Account</h2>
          </div>
          <div className="card">
            {!user?.emailVerified && (
              <div className="field">
                <p
                  style={{
                    color: "var(--text-2)",
                    fontSize: "var(--fs-sm)",
                    marginBottom: "var(--sp-2)",
                  }}
                >
                  Verify your email to secure your account — we&rsquo;ll send you a
                  6-digit code.
                </p>
                <Link to="/verify-email" className="btn btn--secondary btn--full">
                  <Icon name="mail" size={17} /> Verify email now
                </Link>
              </div>
            )}

            {pwOpen ? (
              <form onSubmit={changePassword} noValidate>
                <PasswordField
                  id="pw-current"
                  label="Current password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Current password"
                />
                <PasswordField
                  id="pw-new"
                  label="New password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  autoComplete="new-password"
                  placeholder="New password"
                  error={pwError}
                  showStrength
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={!pwCurrent || !pwNew || pwSaving}
                >
                  {pwSaving ? (
                    <>
                      <BtnSpinner /> Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--full"
                  style={{ marginTop: "var(--sp-2)" }}
                  onClick={() => {
                    setPwOpen(false);
                    setPwError("");
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                className="btn btn--secondary btn--full"
                onClick={() => setPwOpen(true)}
              >
                <Icon name="lock" size={17} /> Change password
              </button>
            )}

            <button
              className="btn btn--ghost btn--full"
              style={{ marginTop: "var(--sp-2)" }}
              onClick={doLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <BtnSpinner /> Logging out…
                </>
              ) : (
                <>
                  <Icon name="logout" size={17} /> Log out
                </>
              )}
            </button>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Preferences</h2>
        </div>
        <div className="card">
          {!isAuthed && (
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
          )}

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

          <div className="field">
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

          <div className="field">
            <label className="field-label" htmlFor="profile-weekly-goal">
              Weekly workout goal
            </label>
            <select
              id="profile-weekly-goal"
              className="input"
              value={profile.weeklyGoal || 3}
              onChange={(e) => update({ weeklyGoal: Number(e.target.value) })}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} workouts / week</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label" htmlFor="profile-water-goal">
              Daily water goal
            </label>
            <select
              id="profile-water-goal"
              className="input"
              value={profile.waterGoal || 2500}
              onChange={(e) => update({ waterGoal: Number(e.target.value) })}
            >
              {[2000, 2500, 3000, 3500, 4000].map((ml) => (
                <option key={ml} value={ml}>{(ml / 1000).toFixed(1)} litres</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Health toolkit ── */}
      <HealthToolkit profile={profile} update={update} />

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Your data</h2>
        </div>
        <div className="card">
          <p
            style={{
              color: "var(--text-2)",
              fontSize: "var(--fs-sm)",
              marginBottom: "var(--sp-4)",
            }}
          >
            {status === "guest"
              ? "Everything is stored on this device only — no account, no cloud, no tracking. Export a backup any time."
              : "Workout data is stored on this device. Export a backup any time."}
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
