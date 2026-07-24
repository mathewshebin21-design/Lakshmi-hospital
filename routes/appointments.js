const express = require("express");
const { insert, readAll } = require("../db");
const { notify } = require("../mailer");
const { requireAdmin } = require("../middleware/adminAuth");

const router = express.Router();

const DEPARTMENTS = [
  "Internal Medicine", "Obstetrics & Gynaecology", "Paediatrics",
  "Orthopaedics", "Cardiology", "Other",
];
const BRANCHES = ["Ernakulam", "Aluva", "Thiruvairanikulam"];

function isValidPhone(phone) {
  return /^[+\d][\d\s-]{6,17}$/.test(phone || "");
}

// POST /api/appointments — public, used by the Contact page form
router.post("/", async (req, res) => {
  const { fullName, phone, department, branch, message } = req.body || {};

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: "Full name is required." });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: "A valid contact number is required." });
  }

  const record = insert("appointments", {
    fullName: fullName.trim(),
    phone: phone.trim(),
    department: DEPARTMENTS.includes(department) ? department : "Other",
    branch: BRANCHES.includes(branch) ? branch : "Ernakulam",
    message: (message || "").trim().slice(0, 1000),
  });

  await notify(
    `New appointment request — ${record.fullName}`,
    `<h2>New Appointment Request</h2>
     <p><b>Name:</b> ${record.fullName}</p>
     <p><b>Phone:</b> ${record.phone}</p>
     <p><b>Department:</b> ${record.department}</p>
     <p><b>Branch:</b> ${record.branch}</p>
     <p><b>Message:</b> ${record.message || "—"}</p>
     <p><i>Submitted ${record.createdAt}</i></p>`
  );

  res.status(201).json({ success: true, id: record.id });
});

// GET /api/appointments — admin only, requires x-admin-key header
router.get("/", requireAdmin, (req, res) => {
  res.json({ appointments: readAll("appointments") });
});

module.exports = router;
