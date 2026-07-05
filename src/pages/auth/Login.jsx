import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { FormError, BtnSpinner } from "./AuthLayout";
import TextField from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import Checkbox from "../../components/Checkbox";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { validateEmail } from "../../lib/validate";

export default function Login() {
  const { login, continueAsGuest } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = {
    email: validateEmail(email),
    password: password ? "" : "Password is required",
  };
  const valid = !errors.email && !errors.password;
  const shown = (field) => (touched[field] ? errors[field] : "");
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setServerError("");
    try {
      const user = await login(email.trim(), password, rememberMe);
      toast(`Welcome back, ${user.name.split(" ")[0]}`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  const guest = () => {
    continueAsGuest();
    toast("Using Forge as a guest — data stays on this device", "info");
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off — your next PR is waiting."
      footer={
        <>
          <div className="auth-divider" role="separator">
            <span>New to Forge?</span>
          </div>
          <Link to="/signup" className="btn btn--secondary btn--full btn--lg">
            Create an account
          </Link>
          <button type="button" className="btn btn--ghost btn--full" onClick={guest}>
            Continue as guest
          </button>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormError>{serverError}</FormError>

        <TextField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={blur("email")}
          error={shown("email")}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          autoFocus
        />

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={blur("password")}
          error={shown("password")}
          placeholder="Your password"
          autoComplete="current-password"
        />

        <div className="auth-row">
          <Checkbox id="login-remember" checked={rememberMe} onChange={setRememberMe}>
            Remember me
          </Checkbox>
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={!valid || loading}
        >
          {loading ? (
            <>
              <BtnSpinner /> Signing in…
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
