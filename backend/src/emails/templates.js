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

exports.verifyOtp = (name, code, ttlMinutes) => ({
  subject: `${code} is your Forge verification code`,
  html: wrap(
    `Welcome${name ? `, ${name}` : ""}! 💪`,
    `<p style="color:#a7b0bc;line-height:1.6">Enter this code in the app to verify your email:</p>
     <p style="margin:20px 0;text-align:center"><span style="display:inline-block;background:#1c2129;border:1px solid rgba(200,245,66,0.35);border-radius:12px;padding:14px 22px;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#c8f542;font-family:ui-monospace,Consolas,monospace">${code}</span></p>
     <p style="font-size:12px;color:#67707d">This code expires in ${ttlMinutes} minutes. Never share it with anyone.</p>`
  ),
  text: `Your Forge verification code is ${code} (expires in ${ttlMinutes} minutes). Never share it with anyone.`,
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
