// Forge API client — the only file that talks to the network.
//
// Access token lives in memory only (never localStorage — XSS-safe);
// the refresh token is an httpOnly cookie scoped to /api/auth that the
// browser sends automatically (`credentials: "include"`). On a 401 the
// client refreshes once and retries the original request; if the
// refresh itself fails the session is expired and AuthContext is told.

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TIMEOUT_MS = 15000;

let accessToken = null;
let onSessionExpired = () => {};

export function setAccessToken(token) {
  accessToken = token || null;
}

/** AuthContext registers a callback so an expired session logs the app out. */
export function configureApi({ sessionExpired } = {}) {
  if (sessionExpired) onSessionExpired = sessionExpired;
}

export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network / timeout
    this.errors = errors; // [{ field, message }] from express-validator
    this.code = code; // "network" | "timeout" | undefined
  }
  /** Message for the field, if the server flagged one. */
  fieldError(field) {
    return this.errors.find((e) => e.field === field)?.message;
  }
}

async function rawRequest(path, { method = "GET", body, signal } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(BASE_URL + path, {
    method,
    credentials: "include",
    headers: {
      ...(isForm ? {} : body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (proxy error page etc.) — fall through to status check.
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, {
      status: res.status,
      errors: data?.errors || [],
    });
  }
  return data;
}

let refreshPromise = null;

/**
 * Refresh the session using the httpOnly cookie. Concurrent callers share
 * one in-flight request — rotation makes a second parallel refresh fatal.
 * Returns { user, accessToken } or throws ApiError.
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = rawRequest("/auth/refresh", { method: "POST" })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout ?? TIMEOUT_MS);

  try {
    try {
      return await rawRequest(path, { ...options, signal: controller.signal });
    } catch (err) {
      // Expired access token → refresh once, replay the request.
      const isAuthEndpoint = path.startsWith("/auth/");
      if (err instanceof ApiError && err.status === 401 && accessToken && !isAuthEndpoint) {
        try {
          await refreshSession();
        } catch {
          setAccessToken(null);
          onSessionExpired();
          throw new ApiError("Your session has expired — please log in again", { status: 401 });
        }
        return await rawRequest(path, { ...options, signal: controller.signal });
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("The server is taking too long to respond — please try again", {
        code: "timeout",
      });
    }
    throw new ApiError("Can't reach the server — check your connection", { code: "network" });
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
