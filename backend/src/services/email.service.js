const nodemailer = require("nodemailer");
const env = require("../config/env");

// SMTP when configured; console transport in development so the full
// auth flow works without an email provider (links are printed to the
// server log).

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (env.smtp.configured) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

async function sendEmail(to, { subject, html, text }) {
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
