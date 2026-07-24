require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const appointmentsRouter = require("./routes/appointments");
const contactRouter = require("./routes/contact");
const { contentRouter } = require("./routes/content");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Security / parsing middleware ---
app.use(express.json({ limit: "50kb" }));

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);

// Rate limit form submissions to curb spam/abuse (20 requests / 15 min / IP)
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/appointments", formLimiter);
app.use("/api/contact", formLimiter);

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use("/api/appointments", appointmentsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/doctors", contentRouter("doctors"));
app.use("/api/departments", contentRouter("departments"));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found." }));

app.listen(PORT, () => {
  console.log(`Lakshmi Hospital backend running on http://localhost:${PORT}`);
});
