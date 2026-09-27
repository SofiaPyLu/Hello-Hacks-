const express = require("express");
const router = express.Router();

const { getSheet } = require("../processors/sheetProcessor");
const { validateCellInput, setCostCell, copyMonth } = require("../sheetEdits");
const { readEntries, writeEntries } = require("../store");
const { isValidMonth } = require("../utils/month");

router.get("/", (req, res) => res.json(getSheet(readEntries())));

router.post("/months", (req, res) => {
  const { from, to } = req.body || {};
  if (!isValidMonth(from) || !isValidMonth(to)) {
    return res.status(400).json({ error: "from and to are required in format YYYY-MM" });
  }

  try {
    const { entries, copied } = copyMonth(readEntries(), from, to);
    writeEntries(entries);
    res.status(201).json({ month: to, copied });
  } catch (err) {
    if (!err.status) throw err;
    res.status(err.status).json({ error: err.message });
  }
});

router.put("/:month/:category/:subcategory", (req, res) => {
  const { month, category, subcategory } = req.params;
  const result = validateCellInput({ month, category, subcategory }, req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const { entries, cell } = setCostCell(readEntries(), { month, category, subcategory }, result.value);
  writeEntries(entries);
  res.json({ month, category, subcategory, cell });
});

module.exports = router;
