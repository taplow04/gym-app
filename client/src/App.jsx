import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import BottomNav from "./components/BottomNav";
import Icon from "./components/Icon";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Timer from "./pages/Timer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// The app tabs need a session — signed in OR explicit guest mode
// (Forge is local-first; guests keep the original no-account experience).
function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "anon") {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// Signed-in users skip login/signup. Guests may still visit them
// (that's how they upgrade to an account from Profile).
function PublicOnly({ children }) {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/" replace />;
  return children;
}

function Shell() {
  const { status } = useAuth();
  const { pathname } = useLocation();
  const onAuthScreen =
    ["/login", "/signup", "/forgot-password"].includes(pathname) ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email");

  // Restoring the previous session — a beat of brand instead of a flash
  // of the wrong screen.
  if (status === "booting") {
    return (
      <div className="splash" aria-label="Loading Forge">
        <span className="auth-logo">
          <Icon name="zap" size={26} strokeWidth={2.4} />
        </span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public (auth) routes — email links land on the token routes */}
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        {/* Register guards itself: becoming authed mid-flow must not
            eject the user out of the optional "About you" step. */}
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Legacy link-based verification emails land on the OTP screen. */}
        <Route path="/verify-email/:token" element={<Navigate to="/verify-email" replace />} />

        {/* App tabs — session required */}
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/plan" element={<RequireAuth><Plan /></RequireAuth>} />
        <Route path="/workout" element={<RequireAuth><Workout /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/timer" element={<RequireAuth><Timer /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!onAuthScreen && <BottomNav />}
    </>
  );
}

// HashRouter + vite base "/gym-app" = GitHub Pages compatible routing.
export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
