import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
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

// Off the critical path: auth screens and the timer load on demand.
// The five tabs stay eager so tab switching is always instant.
const Timer = lazy(() => import("./pages/Timer"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));

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

function Splash() {
  return (
    <div className="splash" aria-label="Loading Forge">
      <span className="auth-logo">
        <Icon name="zap" size={26} strokeWidth={2.4} />
      </span>
    </div>
  );
}

/** Native-style scroll: each tab remembers its position; new screens start at the top. */
const scrollPositions = new Map();
function ScrollMemory() {
  const { pathname } = useLocation();
  const prev = useRef(pathname);
  useLayoutEffect(() => {
    if (prev.current !== pathname) {
      scrollPositions.set(prev.current, window.scrollY);
      prev.current = pathname;
    }
    window.scrollTo(0, scrollPositions.get(pathname) ?? 0);
  }, [pathname]);
  return null;
}

/** Local-first means offline is a mode, not an error — say so calmly. */
function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      <Icon name="alert" size={14} /> Offline — workouts still save on this device
    </div>
  );
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
  if (status === "booting") return <Splash />;

  return (
    <>
      <ScrollMemory />
      <Suspense fallback={<Splash />}>
        <Routes>
          {/* Public (auth) routes */}
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
      </Suspense>
      <OfflineBanner />
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
