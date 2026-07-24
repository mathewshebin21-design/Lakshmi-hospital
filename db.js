// db.js — minimal JSON-file storage. No native modules, no external database
// required. Good enough for moderate form-submission volume; swap for
// Postgres/MongoDB later if the hospital's traffic grows.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const FILES = {
  appointments: path.join(DATA_DIR, "appointments.json"),
  contacts: path.join(DATA_DIR, "contacts.json"),
  doctors: path.join(DATA_DIR, "doctors.json"),
  departments: path.join(DATA_DIR, "departments.json"),
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const file of Object.values(FILES)) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf-8");
  }
}

function readAll(key) {
  ensureStore();
  const raw = fs.readFileSync(FILES[key], "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(key, records) {
  ensureStore();
  fs.writeFileSync(FILES[key], JSON.stringify(records, null, 2), "utf-8");
}

function insert(key, record) {
  const records = readAll(key);
  const withMeta = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    status: "new",
    ...record,
  };
  records.unshift(withMeta);
  writeAll(key, records);
  return withMeta;
}

function insertContent(key, record) {
  const records = readAll(key);
  const withMeta = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    updatedAt: new Date().toISOString(),
    ...record,
  };
  records.push(withMeta);
  writeAll(key, records);
  return withMeta;
}

function update(key, id, patch) {
  const records = readAll(key);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...patch, id, updatedAt: new Date().toISOString() };
  writeAll(key, records);
  return records[idx];
}

function remove(key, id) {
  const records = readAll(key);
  const next = records.filter((r) => r.id !== id);
  const removed = next.length !== records.length;
  if (removed) writeAll(key, next);
  return removed;
}

module.exports = { readAll, writeAll, insert, insertContent, update, remove };
