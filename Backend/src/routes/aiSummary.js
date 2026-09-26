const express = require("express");
const router = express.Router();

const { generateAiSummary } = require("../ai/aiSummary");
const { readEntries } = require("../store");
const { isValidMonth } = require("../utils/month");

router.post("/", async (req, res) => {
  const month = req.body && req.body.month;
  if (!isValidMonth(month)) {
    return res.status(400).json({ error: "month is required in format YYYY-MM" });
  }

  try {
    res.json(await generateAiSummary(month, readEntries()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
