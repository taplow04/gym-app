import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// PWA: offline shell + installability. Production only — the dev server
// must never be cached. BASE_URL keeps the scope right on both GitHub
// Pages (/gym-app/) and Vercel (/).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    navigator.serviceWorker
      .register(`${base}sw.js`)
      .catch(() => {}); // unsupported/blocked — the app works fine without it
  });
}
