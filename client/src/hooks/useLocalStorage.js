import { useCallback, useState } from "react";

// All persisted state flows through this hook — the app never loses
// data on navigation or reload. Keys are namespaced under "forge.".

const PREFIX = "forge.";

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    if (value === undefined) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // Storage full or unavailable — state still works in memory.
  }
}

export function clearStore() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export default function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback));

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        writeStore(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}
