
import { NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";
import { readStore } from "../hooks/useLocalStorage";

const TABS = [
  { to: "/", icon: "home", label: "Home", end: true },
  { to: "/plan", icon: "calendar", label: "Plan" },
  { to: "/workout", icon: "dumbbell", label: "Start", center: true },
  { to: "/progress", icon: "chart", label: "Progress" },
  { to: "/profile", icon: "user", label: "Profile" },
];

export default function BottomNav() {
  // Re-reads on every route change so the disc pulses while a session runs.
  useLocation();
  const live = Boolean(readStore("activeSession", null));

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((tab) =>
        tab.center ? (
          <NavLink key={tab.to} to={tab.to} className="nav-start" aria-label={live ? "Resume workout" : "Start workout"}>
            <span className={`nav-start-disc${live ? " nav-start-disc--live" : ""}`}>
              <Icon name={live ? "play" : "dumbbell"} size={24} strokeWidth={2.2} />
            </span>
          </NavLink>
        ) : (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon name={tab.icon} size={22} />
            {tab.label}
          </NavLink>
        )
      )}
    </nav>
  );
}
