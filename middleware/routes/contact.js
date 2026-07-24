const express = require("express");
const { insert, readAll } = require("../db");
const { notify } = require("../mailer");
const { requireAdmin } = require("../middleware/adminAuth");

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

// POST /api/contact — public
router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const record = insert("contacts", {
    name: name.trim(),
    email: email.trim(),
    phone: (phone || "").trim(),
    message: message.trim().slice(0, 2000),
  });

  await notify(
    `New website contact message — ${record.name}`,
    `<h2>New Contact Message</h2>
     <p><b>Name:</b> ${record.name}</p>
     <p><b>Email:</b> ${record.email}</p>
     <p><b>Phone:</b> ${record.phone || "—"}</p>
     <p><b>Message:</b><br/>${record.message}</p>
     <p><i>Submitted ${record.createdAt}</i></p>`
  );

  res.status(201).json({ success: true, id: record.id });
});

// GET /api/contact — admin only
router.get("/", requireAdmin, (req, res) => {
  res.json({ contacts: readAll("contacts") });
});

module.exports = router;
