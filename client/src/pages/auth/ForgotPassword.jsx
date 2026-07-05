import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout, { FormError, BtnSpinner } from "./AuthLayout";
import TextField from "../../components/TextField";
import Icon from "../../components/Icon";
import { api } from "../../lib/api";
import { validateEmail } from "../../lib/validate";

// The API always answers 200 (no account enumeration), so the success
// state is unconditional once the request lands.

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const error = validateEmail(email);
  const submit = async (e) => {
    e.preventDefault();
    if (error || loading) return;
    setLoading(true);
    setServerError("");
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="auth-result">
          <span className="auth-result-icon auth-result-icon--ok">
            <Icon name="mail" size={28} strokeWidth={1.8} />
          </span>
          <p className="auth-result-text">
            If <strong>{email.trim()}</strong> is registered, a reset link is on
            its way. It expires in <strong>15 minutes</strong> — check spam if it
            doesn&rsquo;t show up.
          </p>
          <Link to="/login" className="btn btn--primary btn--full btn--lg">
            Back to login
          </Link>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No problem — enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="auth-link auth-link--center">
          <Icon name="arrow-left" size={16} /> Back to login
        </Link>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormError>{serverError}</FormError>

        <TextField
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched ? error : ""}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          autoFocus
        />

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={!!error || loading}
        >
          {loading ? (
            <>
              <BtnSpinner /> Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
