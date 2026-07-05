const nodemailer = require("nodemailer");
const env = require("../config/env");

// Transport priority:
//   1. Brevo HTTPS API  — port 443; hosts like Render block outbound SMTP,
//      so this is the reliable path in production (BREVO_API_KEY).
//   2. SMTP             — works locally / on hosts that allow port 587.
//   3. Console (dev)    — no provider configured; links print to the log.
//
// Callers should treat sendEmail as fire-and-forget (attach .catch) — an
// HTTP response must never wait on an email provider.

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (env.smtp.configured) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      // Fail fast — a firewalled port must not hang for nodemailer's
      // 2-minute default.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

/** "Forge <no-reply@forge.app>" → { name, email } for the Brevo API. */
function parseFrom(from) {
  const match = from.match(/^(.*)<([^>]+)>\s*$/);
  if (!match) return { name: "Forge", email: from.trim() };
  return {
    name: match[1].trim().replace(/^"+|"+$/g, "") || "Forge",
    email: match[2].trim(),
  };
}

async function sendViaBrevoApi(to, { subject, html, text }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.brevoApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: parseFrom(env.smtp.from),
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Brevo API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function sendEmail(to, { subject, html, text }) {
  if (env.brevoApiKey) return sendViaBrevoApi(to, { subject, html, text });

  const info = await getTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  });
  if (!env.smtp.configured) {
    console.log(`📧 [dev email → ${to}] ${subject}\n   ${text}`);
  }
  return info;
}

module.exports = { sendEmail };
