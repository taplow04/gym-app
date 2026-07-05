// Minimal, dependency-free HTML email templates. Volt-on-dark to match
// the product. Each returns { subject, html, text }.

const wrap = (title, bodyHtml) => `
<div style="background:#0b0d10;padding:32px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#14171c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;color:#f2f4f8">
    <p style="margin:0 0 16px;font-weight:800;letter-spacing:0.08em;color:#c8f542">FORGE</p>
    <h1 style="margin:0 0 12px;font-size:22px">${title}</h1>
    ${bodyHtml}
    <p style="margin:24px 0 0;font-size:12px;color:#67707d">If you didn't request this, you can safely ignore this email.</p>
  </div>
</div>`;

const button = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:#c8f542;color:#12160a;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;margin:16px 0">${label}</a>`;

exports.verifyEmail = (name, url) => ({
  subject: "Verify your email — Forge",
  html: wrap(
    `Welcome${name ? `, ${name}` : ""}! 💪`,
    `<p style="color:#a7b0bc;line-height:1.6">One tap to verify your email and secure your account:</p>${button(url, "Verify email")}<p style="font-size:12px;color:#67707d">This link expires in 24 hours.</p>`
  ),
  text: `Welcome to Forge! Verify your email: ${url} (expires in 24 hours)`,
});

exports.resetPassword = (name, url) => ({
  subject: "Reset your password — Forge",
  html: wrap(
    "Password reset",
    `<p style="color:#a7b0bc;line-height:1.6">${name ? `${name}, w` : "W"}e received a request to reset your password:</p>${button(url, "Reset password")}<p style="font-size:12px;color:#67707d">This link expires in 15 minutes.</p>`
  ),
  text: `Reset your Forge password: ${url} (expires in 15 minutes)`,
});

exports.passwordChanged = (name) => ({
  subject: "Your password was changed — Forge",
  html: wrap(
    "Password changed",
    `<p style="color:#a7b0bc;line-height:1.6">${name ? `${name}, y` : "Y"}our password was just changed. If this wasn't you, reset it immediately and contact support.</p>`
  ),
  text: "Your Forge password was changed. If this wasn't you, reset it immediately.",
});
