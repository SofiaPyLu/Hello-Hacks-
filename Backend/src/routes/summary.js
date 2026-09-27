const express = require("express");
const { getSummary } = require("../processors/summaryProcessor");
const { readEntries } = require("../store");
const { isValidMonth } = require("../utils/month");

const router = express.Router();

router.get("/", (req, res) => {
  const month = req.query.month;
  if (!isValidMonth(month)) {
    return res.status(400).json({ error: "month is required in format YYYY-MM" });
  }

  res.json(getSummary(readEntries(), month));
});

module.exports = router;
