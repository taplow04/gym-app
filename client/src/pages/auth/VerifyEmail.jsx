import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout, { BtnSpinner } from "./AuthLayout";
import Icon from "../../components/Icon";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

// Landed from the email link (/#/verify-email/:token). The token is
// single-use, so the effect must fire exactly once — the ref guard also
// covers StrictMode's double-invoke in dev.

export default function VerifyEmail() {
  const { token } = useParams();
  const { isAuthed, applyUser } = useAuth();
  const toast = useToast();

  const [state, setState] = useState("verifying"); // verifying | ok | bad
  const [resending, setResending] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api
      .post(`/auth/verify-email/${token}`)
      .then(() => {
        setState("ok");
        applyUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
      })
      .catch(() => setState("bad"));
  }, [token, applyUser]);

  const resend = async () => {
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

  if (state === "verifying") {
    return (
      <AuthLayout title="Verifying your email…">
        <div className="auth-result">
          <span className="auth-result-icon">
            <BtnSpinner />
          </span>
          <p className="auth-result-text">Hang tight — this only takes a second.</p>
        </div>
      </AuthLayout>
    );
  }

  if (state === "ok") {
    return (
      <AuthLayout title="Email verified">
        <div className="auth-result">
          <span className="auth-result-icon auth-result-icon--ok">
            <Icon name="check" size={28} strokeWidth={2.4} />
          </span>
          <p className="auth-result-text">
            You&rsquo;re all set. Your account is fully activated — time to train.
          </p>
          <Link
            to={isAuthed ? "/" : "/login"}
            className="btn btn--primary btn--full btn--lg"
          >
            {isAuthed ? "Go to dashboard" : "Log in"}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Link expired">
      <div className="auth-result">
        <span className="auth-result-icon auth-result-icon--bad">
          <Icon name="alert" size={28} strokeWidth={1.8} />
        </span>
        <p className="auth-result-text">
          This verification link is invalid or has expired — or your email is
          already verified.
        </p>
        {isAuthed ? (
          <button
            type="button"
            className="btn btn--primary btn--full btn--lg"
            onClick={resend}
            disabled={resending}
          >
            {resending ? (
              <>
                <BtnSpinner /> Sending…
              </>
            ) : (
              "Send a new link"
            )}
          </button>
        ) : (
          <Link to="/login" className="btn btn--primary btn--full btn--lg">
            Log in to resend it
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
