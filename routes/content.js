const express = require("express");
const { readAll, insertContent, update, remove } = require("../db");
const { requireAdmin } = require("../middleware/adminAuth");

// Builds a router for a simple content collection (doctors or departments):
//   GET    /            -> public, list all
//   POST   /            -> admin, create
//   PUT    /:id         -> admin, update
//   DELETE /:id         -> admin, delete
function contentRouter(collectionKey) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({ [collectionKey]: readAll(collectionKey) });
  });

  router.post("/", requireAdmin, (req, res) => {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ error: "'name' is required." });
    }
    const record = insertContent(collectionKey, req.body);
    res.status(201).json(record);
  });

  router.put("/:id", requireAdmin, (req, res) => {
    const updated = update(collectionKey, req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "Not found." });
    res.json(updated);
  });

  router.delete("/:id", requireAdmin, (req, res) => {
    const ok = remove(collectionKey, req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found." });
    res.json({ success: true });
  });

  return router;
}

module.exports = { contentRouter };
