const express = require("express");
const { getSummary } = require("../processors/summaryProcessor");
const { readEntries } = require("../store");
const { isValidMonth } = require("../utils/month");

const router = express.Router();

router.post("/", (req, res) => {
  const { month } = req.body || {};
  if (!isValidMonth(month)) {
    return res.status(400).json({ error: "month is required in format YYYY-MM" });
  }

  const summary = getSummary(readEntries(), month);
  const margin = summary.profitMargin === null ? "unavailable" : `${summary.profitMargin}%`;
  const avgSpend = summary.avgSpendPerCustomer === null
    ? "unavailable"
    : `$${summary.avgSpendPerCustomer.toFixed(2)}`;
  const text = `${month}: revenue was $${summary.totalRevenue.toFixed(2)}, costs were $${summary.totalCosts.toFixed(2)}, and net profit was $${summary.netProfit.toFixed(2)} (${margin} profit margin). The restaurant served ${summary.customers} customers with average spend of ${avgSpend} per customer.`;

  return res.json({ summary: text });
});

module.exports = router;
