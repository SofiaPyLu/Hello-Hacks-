const express = require("express");
const { CATEGORIES } = require("../constants");
const { addEntry, deleteEntry, readEntries, updateEntry } = require("../store");
const { isValidMonth } = require("../utils/month");

const router = express.Router();

function validateEntry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "entry body is required";
  if (!isValidMonth(body.month)) return "month is required in format YYYY-MM";
  if (body.type !== "cost" && body.type !== "revenue") return "type must be cost or revenue";

  const categorySet = CATEGORIES[body.type];
  if (!Object.hasOwn(categorySet, body.category)) return "invalid category";
  if (!categorySet[body.category].includes(body.subcategory)) return "invalid subcategory";
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount < 0) {
    return "amount must be a non-negative number";
  }
  if (body.type === "revenue" && (!Number.isFinite(body.customers) || body.customers < 0)) {
    return "customers must be a non-negative number for revenue entries";
  }
  if (body.category === "salaries") {
    if (!Number.isFinite(body.count) || body.count < 0) return "count must be a non-negative number for salary entries";
    if (!Number.isFinite(body.payPerPerson) || body.payPerPerson < 0) {
      return "payPerPerson must be a non-negative number for salary entries";
    }
  }
  return null;
}

router.get("/", (req, res) => {
  const { month } = req.query;
  if (month !== undefined && !isValidMonth(month)) {
    return res.status(400).json({ error: "month must be in format YYYY-MM" });
  }
  const entries = readEntries();
  return res.json(month ? entries.filter((entry) => entry.month === month) : entries);
});

router.post("/", (req, res) => {
  const error = validateEntry(req.body);
  if (error) return res.status(400).json({ error });
  const { id, ...entryWithoutId } = req.body;
  return res.status(201).json(addEntry(entryWithoutId));
});

router.put("/:id", (req, res) => {
  const error = validateEntry(req.body);
  if (error) return res.status(400).json({ error });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "id must be a positive integer" });
  const { id: ignoredId, ...entryWithoutId } = req.body;
  const updated = updateEntry(id, entryWithoutId);
  if (!updated) return res.status(404).json({ error: "entry not found" });
  return res.json(updated);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "id must be a positive integer" });
  if (!deleteEntry(id)) return res.status(404).json({ error: "entry not found" });
  return res.status(204).end();
});

module.exports = router;
