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

  // ── Email verification ──
  const [resending, setResending] = useState(false);
  const resendVerification = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      toast("Verification email sent — check your inbox", "success");
    } catch (err) {
      toast(err.message, "danger");
    } finally {
      setResending(false);
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
                  Verify your email to secure your account — the link lasts 24 hours.
                </p>
                <button
                  className="btn btn--secondary btn--full"
                  onClick={resendVerification}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <BtnSpinner /> Sending…
                    </>
                  ) : (
                    <>
                      <Icon name="mail" size={17} /> Resend verification email
                    </>
                  )}
                </button>
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
