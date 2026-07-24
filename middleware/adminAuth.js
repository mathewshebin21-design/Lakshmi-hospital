// Simple shared-secret admin check. Good enough for a small staff dashboard;
// upgrade to real user accounts + hashed passwords if multiple staff need
// individual logins later.

function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: "Server misconfigured: ADMIN_KEY not set." });
  }
  if (key && key === process.env.ADMIN_KEY) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized." });
}

module.exports = { requireAdmin };
