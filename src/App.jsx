
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";

// HashRouter + vite base "/gym-app" = GitHub Pages compatible routing.
export default function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </ToastProvider>
    </Router>
  );
}
