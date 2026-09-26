const express = require("express");
const { getCostsForMonth } = require("../processors/costProcessor");
const { readEntries } = require("../store");
const { isValidMonth } = require("../utils/month");

const router = express.Router();

router.get("/", (req, res) => {
  const month = req.query.month;
  if (!isValidMonth(month)) {
    return res.status(400).json({ error: "month is required in format YYYY-MM" });
  }

  const entries = readEntries();
  const result = getCostsForMonth(entries, month);
  res.json(result);
});

module.exports = router;
