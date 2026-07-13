import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { FormError, BtnSpinner } from "./AuthLayout";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import Checkbox from "../../components/Checkbox";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { validateEmail, validateName, validatePassword } from "../../lib/validate";

// Two-step signup: the account itself (required), then optional training
// stats saved via PATCH /users/me — skippable, like the best onboarding
// flows. The account already exists once step 2 shows, so skipping is safe.

const GOALS = [
  ["build-muscle", "Build muscle"],
  ["gain-strength", "Gain strength"],
  ["lose-fat", "Lose fat"],
  ["improve-endurance", "Endurance"],
  ["maintain", "Stay fit"],
];

const LEVELS = [
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
];

export default function Register() {
  const { register, updateProfile, isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // The OTP screen sends users back here for the optional profile step.
  const [step] = useState(location.state?.step === 2 ? 2 : 1);
  // Once the account POST is in flight we're intentionally becoming
  // authed — the "already signed in" guard below must stand down or its
  // <Navigate to="/"> races (and beats) our redirect to the OTP screen.
  const creating = useRef(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ── Step 1 — account ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirm: confirm === password ? "" : "Passwords don't match",
  };
  const valid = agreed && Object.values(errors).every((e) => !e);
  const shown = (field) => (touched[field] ? errors[field] : "");
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  // ── Step 2 — optional profile ──
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const createAccount = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setServerError("");
    creating.current = true;
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      toast("Account created — we emailed you a 6-digit code", "success");
      navigate("/verify-email", { state: { from: "signup" } });
    } catch (err) {
      creating.current = false;
      // Field-level messages from the API win over the generic banner.
      const fieldMsg = err.fieldError?.("email") || err.fieldError?.("password");
      setServerError(fieldMsg || err.message);
      setTouched({ name: true, email: true, password: true, confirm: true });
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    if (loading) return;
    const patch = {};
    if (goal) patch.fitnessGoal = goal;
    if (level) patch.experienceLevel = level;
    if (gender) patch.gender = gender;
    if (heightCm) patch.heightCm = Number(heightCm);
    if (weightKg) patch.weightKg = Number(weightKg);

    if (Object.keys(patch).length === 0) return finish();

    setLoading(true);
    try {
      await updateProfile(patch);
      finish();
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  const finish = () => {
    toast("You're all set — let's train", "success");
    navigate("/", { replace: true });
  };

  // Already signed in and not mid-onboarding → nothing to do here.
  if (isAuthed && step === 1 && !creating.current) return <Navigate to="/" replace />;

  if (step === 2) {
    return (
      <AuthLayout
        title="About you"
        subtitle="Optional — helps Forge tailor your experience. You can change everything later."
        footer={
          <button type="button" className="btn btn--ghost btn--full" onClick={finish}>
            Skip for now
          </button>
        }
      >
        <form onSubmit={saveDetails} noValidate>
          <FormError>{serverError}</FormError>

          <div className="field">
            <span className="field-label">Main goal</span>
            <div className="chip-row">
              {GOALS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`chip${goal === value ? " chip--active" : ""}`}
                  aria-pressed={goal === value}
                  onClick={() => setGoal(goal === value ? "" : value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Experience</span>
            <div className="chip-row">
              {LEVELS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`chip${level === value ? " chip--active" : ""}`}
                  aria-pressed={level === value}
                  onClick={() => setLevel(level === value ? "" : value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="reg-gender">
              Gender
            </label>
            <select
              id="reg-gender"
              className="input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="auth-grid-2">
            <TextField
              id="reg-height"
              label="Height (cm)"
              type="number"
              inputMode="decimal"
              min="50"
              max="300"
              placeholder="175"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
            <TextField
              id="reg-weight"
              label="Weight (kg)"
              type="number"
              inputMode="decimal"
              min="20"
              max="500"
              placeholder="72"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
            {loading ? (
              <>
                <BtnSpinner /> Saving…
              </>
            ) : (
              "Save & start training"
            )}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Every rep counted, every PR remembered — on all your devices."
      footer={
        <>
          <div className="auth-divider" role="separator">
            <span>Already training with us?</span>
          </div>
          <Link to="/login" className="btn btn--secondary btn--full btn--lg">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={createAccount} noValidate>
        <FormError>{serverError}</FormError>

        <TextField
          id="reg-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={blur("name")}
          error={shown("name")}
          placeholder="Alex Carter"
          autoComplete="name"
          autoFocus
        />

        <TextField
          id="reg-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={blur("email")}
          error={shown("email")}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
        />

        <PasswordField
          id="reg-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={blur("password")}
          error={shown("password")}
          hint="8+ characters with at least one letter and one number"
          placeholder="Create a password"
          autoComplete="new-password"
          showStrength
        />

        <PasswordField
          id="reg-confirm"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={blur("confirm")}
          error={shown("confirm")}
          placeholder="Repeat the password"
          autoComplete="new-password"
        />

        <div className="auth-row auth-row--start">
          <Checkbox id="reg-terms" checked={agreed} onChange={setAgreed}>
            I agree to the Terms &amp; Conditions and Privacy Policy
          </Checkbox>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={!valid || loading}
        >
          {loading ? (
            <>
              <BtnSpinner /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
