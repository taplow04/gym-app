import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout, { FormError, BtnSpinner } from "./AuthLayout";
import PasswordField from "../../components/PasswordField";
import Icon from "../../components/Icon";
import { api } from "../../lib/api";
import { validatePassword } from "../../lib/validate";

// Landed from the email link (/#/reset-password/:token). A successful
// reset revokes every session server-side, so the only path forward is
// a fresh login.

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [tokenDead, setTokenDead] = useState(false);

  const errors = {
    password: validatePassword(password),
    confirm: confirm === password ? "" : "Passwords don't match",
  };
  const valid = !errors.password && !errors.confirm;
  const shown = (field) => (touched[field] ? errors[field] : "");
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setServerError("");
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
    } catch (err) {
      // 400 here means the one-time token is spent or expired — the form
      // can't succeed anymore, so swap to the recovery path.
      if (err.status === 400) setTokenDead(true);
      else setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="auth-result">
          <span className="auth-result-icon auth-result-icon--ok">
            <Icon name="shield" size={28} strokeWidth={1.8} />
          </span>
          <p className="auth-result-text">
            Your password has been reset and every other session was signed out
            for safety. Log in with your new password to continue.
          </p>
          <Link to="/login" className="btn btn--primary btn--full btn--lg">
            Log in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (tokenDead) {
    return (
      <AuthLayout title="Link expired">
        <div className="auth-result">
          <span className="auth-result-icon auth-result-icon--bad">
            <Icon name="alert" size={28} strokeWidth={1.8} />
          </span>
          <p className="auth-result-text">
            This reset link is invalid or has expired — they only live for
            15 minutes. Request a fresh one and try again.
          </p>
          <Link to="/forgot-password" className="btn btn--primary btn--full btn--lg">
            Request a new link
          </Link>
          <Link to="/login" className="auth-link auth-link--center">
            <Icon name="arrow-left" size={16} /> Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Make it strong — you're the only one who should be lifting here."
    >
      <form onSubmit={submit} noValidate>
        <FormError>{serverError}</FormError>

        <PasswordField
          id="reset-password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={blur("password")}
          error={shown("password")}
          hint="8+ characters with at least one letter and one number"
          placeholder="New password"
          autoComplete="new-password"
          showStrength
          autoFocus
        />

        <PasswordField
          id="reset-confirm"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={blur("confirm")}
          error={shown("confirm")}
          placeholder="Repeat the password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={!valid || loading}
        >
          {loading ? (
            <>
              <BtnSpinner /> Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
