import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  setAccessToken,
  refreshSession,
  configureApi,
  warmUpServer,
} from "../lib/api";
import { readStore, writeStore } from "../hooks/useLocalStorage";
import { useToast } from "../components/Toast";

// Session state for the whole app.
//
//   status: "booting" — restoring the session on first paint
//           "authed"  — signed in (access token in memory, refresh cookie set)
//           "guest"   — using Forge without an account (local-only, the
//                       original mode of the app — data stays in forge.*)
//           "anon"    — no session; router sends these users to /login
//
// Only the mode flag and a display cache of the user are persisted;
// tokens never touch localStorage.

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const toast = useToast();
  const [status, setStatus] = useState("booting");
  const [user, setUser] = useState(() => readStore("authUser", null));

  const enterSession = useCallback((nextUser) => {
    writeStore("authMode", "user");
    writeStore("authUser", nextUser);
    // Home greets from the local profile — keep it in step with the account.
    const profile = readStore("profile", { name: "", unit: "kg", restSec: 90 });
    if (profile.name !== nextUser.name) {
      writeStore("profile", { ...profile, name: nextUser.name });
    }
    setUser(nextUser);
    setStatus("authed");
  }, []);

  const clearSession = useCallback((nextStatus = "anon") => {
    setAccessToken(null);
    writeStore("authMode", nextStatus === "guest" ? "guest" : undefined);
    writeStore("authUser", undefined);
    setUser(null);
    setStatus(nextStatus);
  }, []);

  // ── Boot: restore the previous session ──
  useEffect(() => {
    let cancelled = false;
    // Free-tier hosting sleeps when idle — start waking it immediately so
    // it's ready by the time the user submits a form.
    warmUpServer();
    const mode = readStore("authMode", null);

    if (mode === "guest") {
      setStatus("guest");
    } else if (mode === "user") {
      refreshSession()
        .then(({ user: fresh }) => {
          if (cancelled) return;
          enterSession(fresh);
        })
        .catch(() => {
          if (cancelled) return;
          clearSession(); // cookie expired/revoked — land on login quietly
        });
    } else {
      setStatus("anon");
    }
    return () => {
      cancelled = true;
    };
  }, [enterSession, clearSession]);

  // Mid-session expiry (refresh rejected during a request) → log out loudly.
  useEffect(() => {
    configureApi({
      sessionExpired: () => {
        clearSession();
        toast("Session expired — please log in again", "danger");
      },
    });
  }, [clearSession, toast]);

  const login = useCallback(
    async (email, password, rememberMe) => {
      const res = await api.post("/auth/login", { email, password, rememberMe });
      setAccessToken(res.data.accessToken);
      enterSession(res.data.user);
      return res.data.user;
    },
    [enterSession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const res = await api.post("/auth/register", { name, email, password });
      setAccessToken(res.data.accessToken);
      enterSession(res.data.user);
      return res.data.user;
    },
    [enterSession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Cookie may already be gone — local logout still proceeds.
    }
    clearSession();
  }, [clearSession]);

  const continueAsGuest = useCallback(() => {
    clearSession("guest");
  }, [clearSession]);

  /** PATCH profile fields; keeps context + display cache in sync. */
  const updateProfile = useCallback(async (patch) => {
    const res = await api.patch("/users/me", patch);
    setUser(res.data.user);
    writeStore("authUser", res.data.user);
    return res.data.user;
  }, []);

  /** Local user patch (e.g. after verify-email / avatar upload). */
  const applyUser = useCallback((patchOrUser) => {
    setUser((prev) => {
      const next =
        typeof patchOrUser === "function"
          ? patchOrUser(prev)
          : { ...prev, ...patchOrUser };
      writeStore("authUser", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthed: status === "authed",
      isGuest: status === "guest",
      login,
      register,
      logout,
      continueAsGuest,
      updateProfile,
      applyUser,
    }),
    [status, user, login, register, logout, continueAsGuest, updateProfile, applyUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
