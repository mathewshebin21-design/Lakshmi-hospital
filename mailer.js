// mailer.js — sends a notification email when a new form is submitted.
// If SMTP env vars aren't set, this quietly logs to the console instead of
// throwing, so the API still works during local development/testing.

const nodemailer = require("nodemailer");

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notify(subject, html) {
  if (!transporter) {
    console.log(`[mailer] SMTP not configured — skipping email.\nSubject: ${subject}`);
    return { sent: false, reason: "smtp_not_configured" };
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_TO || process.env.SMTP_USER,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] Failed to send email:", err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { notify };
