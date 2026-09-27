const express = require("express");
const router = express.Router();

const { validateEntry } = require("../validation/validateEntry");
const { addEntry, updateEntry, deleteEntry } = require("../store");

function parseId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "id must be a positive integer" });
    return null;
  }
  return id;
}

router.post("/", (req, res) => {
  const result = validateEntry(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.status(201).json(addEntry(result.entry));
});

router.put("/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const result = validateEntry(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const updated = updateEntry(id, result.entry);
  if (!updated) return res.status(404).json({ error: `entry ${id} not found` });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  if (!deleteEntry(id)) return res.status(404).json({ error: `entry ${id} not found` });
  res.json({ deleted: id });
});

module.exports = router;
