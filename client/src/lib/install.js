// PWA install prompt plumbing. Chrome fires `beforeinstallprompt` early —
// often before any component mounts — so the event is captured at module
// scope and components subscribe to availability changes.

let deferred = null;
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(Boolean(deferred)));

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // no mini-infobar; we offer install on our own terms
  deferred = e;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferred = null;
  notify();
});

/** Subscribe to install availability. Calls back immediately; returns unsubscribe. */
export function onInstallAvailable(fn) {
  listeners.add(fn);
  fn(Boolean(deferred));
  return () => listeners.delete(fn);
}

/** Show the browser install dialog. Resolves true if the user accepted. */
export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  if (outcome === "accepted") deferred = null;
  notify();
  return outcome === "accepted";
}

/** Already running as an installed app? */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
