// Client-side validation, mirroring the API's rules exactly
// (backend/src/validators/auth.validators.js) so the server never
// rejects something the form allowed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return "Email is required";
  if (!EMAIL_RE.test(value)) return "Enter a valid email address";
  return "";
}

export function validateName(name) {
  const value = name.trim();
  if (!value) return "Name is required";
  if (value.length > 80) return "Name must be 80 characters or fewer";
  return "";
}

/** API rule: 8–128 chars, at least one letter and one number. */
export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "At least 8 characters";
  if (password.length > 128) return "Password must be 128 characters or fewer";
  if (!/[a-zA-Z]/.test(password)) return "Add at least one letter";
  if (!/\d/.test(password)) return "Add at least one number";
  return "";
}

/**
 * Strength score 0–4 for the meter: length, casing mix, digits, symbols.
 * Purely advisory — only validatePassword gates submission.
 */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  score = Math.min(4, Math.floor(score));
  const label = ["Too weak", "Weak", "Okay", "Strong", "Very strong"][score];
  return { score, label };
}
