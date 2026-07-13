import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { FormError, BtnSpinner } from "./AuthLayout";
import Icon from "../../components/Icon";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

// OTP email verification. Registration emails a 6-digit code and lands
// here; arriving any other way (e.g. from Profile) requests a fresh code
// automatically. Six boxes, auto-advance, paste, backspace navigation,
// auto-submit on the sixth digit.

const LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyEmail() {
  const { status, user, applyUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSignup = location.state?.from === "signup";

  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);
  const sentOnMount = useRef(false);

  // Arrived without a just-sent code → request one (cooldown errors are fine).
  useEffect(() => {
    if (fromSignup || sentOnMount.current || status !== "authed" || user?.emailVerified) return;
    sentOnMount.current = true;
    api.post("/auth/resend-otp").catch(() => {});
  }, [fromSignup, status, user]);

  // Resend countdown.
  useEffect(() => {
    if (cooldown <= 0 || verified) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0, verified]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(
    async (code) => {
      if (checking) return;
      setChecking(true);
      setError("");
      try {
        const res = await api.post("/auth/verify-otp", { code });
        applyUser(res.data?.user || { emailVerified: true });
        if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
        setVerified(true);
      } catch (err) {
        setError(err.fieldError?.("code") || err.message);
        setDigits(Array(LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      } finally {
        setChecking(false);
      }
    },
    [checking, applyUser]
  );

  const fill = (next) => {
    setDigits(next);
    if (next.every((d) => d !== "")) submit(next.join(""));
  };

  const onChange = (i, raw) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      fill(digits.map((d, j) => (j === i ? "" : d)));
      return;
    }
    // Typed or autocompleted several digits (e.g. iOS one-time-code).
    const next = [...digits];
    for (let k = 0; k < value.length && i + k < LENGTH; k++) next[i + k] = value[k];
    const focusIdx = Math.min(i + value.length, LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
    fill(next);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
      fill(digits.map((d, j) => (j === i - 1 ? "" : d)));
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH)
      .fill("")
      .map((_, i) => text[i] || "");
    inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
    fill(next);
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/auth/resend-otp");
      toast("New code sent — check your inbox", "success");
      setCooldown(RESEND_SECONDS);
      setDigits(Array(LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const continueOn = () => {
    if (fromSignup) navigate("/signup", { state: { step: 2 }, replace: true });
    else navigate("/", { replace: true });
  };

  // Guests/anon can't verify anything; booting shows nothing meaningful here.
  if (status === "anon") return <Navigate to="/login" replace />;
  if (status === "guest") return <Navigate to="/" replace />;
  if (status === "booting") return null;

  if (verified || user?.emailVerified) {
    return (
      <AuthLayout title="Email verified">
        <div className="auth-result">
          <span className="auth-result-icon auth-result-icon--ok otp-success-pop">
            <Icon name="check" size={28} strokeWidth={2.4} />
          </span>
          <p className="auth-result-text">
            You&rsquo;re all set. Your account is fully activated — time to train.
          </p>
          <button className="btn btn--primary btn--full btn--lg" onClick={continueOn}>
            {fromSignup ? "Continue" : "Go to dashboard"}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${user?.email || "your inbox"}. It expires in 10 minutes.`}
      footer={
        !fromSignup && (
          <button type="button" className="btn btn--ghost btn--full" onClick={() => navigate(-1)}>
            <Icon name="arrow-left" size={16} /> Back
          </button>
        )
      }
    >
      <FormError>{error}</FormError>

      <div
        className={`otp-row${checking ? " otp-row--busy" : ""}${error ? " otp-row--error" : ""}`}
        onPaste={onPaste}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="otp-box"
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={LENGTH} /* allow multi-digit autocomplete into one box */
            value={digit}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={checking}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {checking && (
        <p className="otp-status">
          <BtnSpinner /> Verifying…
        </p>
      )}

      <div className="otp-resend">
        {cooldown > 0 ? (
          <span className="otp-resend-wait">
            Didn&rsquo;t get it? Resend in <strong>{cooldown}s</strong>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn--secondary btn--full"
            onClick={resend}
            disabled={resending}
          >
            {resending ? (
              <>
                <BtnSpinner /> Sending…
              </>
            ) : (
              <>
                <Icon name="mail" size={17} /> Resend code
              </>
            )}
          </button>
        )}
      </div>

      {fromSignup && (
        <button type="button" className="btn btn--ghost btn--full" onClick={continueOn}>
          Verify later
        </button>
      )}
    </AuthLayout>
  );
}
