const { CATEGORIES } = require("../constants");
const { getSummary } = require("./summaryProcessor");
const { round2 } = require("../utils/round");

// kind is "cost", "salaries" or "earnings" — it decides the extra fields on a cell.
function buildCell(entries, kind) {
  const cell = { amount: 0, entries: 0 };
  if (kind === "salaries") {
    cell.count = 0;
    cell.payPerPerson = null;
  }
  if (kind === "earnings") cell.customers = 0;

  for (const entry of entries) {
    cell.amount = round2(cell.amount + (Number(entry.amount) || 0));
    cell.entries += 1;
    if (kind === "salaries") cell.count += Number(entry.count) || 0;
    if (kind === "earnings") cell.customers += Number(entry.customers) || 0;
  }

  // ponytail: a merged salary cell reports the blended rate, not any one entry's.
  if (kind === "salaries" && cell.count > 0) {
    cell.payPerPerson = round2(cell.amount / cell.count);
  }
  return cell;
}

function buildCells(rowEntries, months, kind) {
  const cells = {};
  for (const month of months) {
    cells[month] = buildCell(rowEntries.filter((entry) => entry.month === month), kind);
  }
  return cells;
}

function getSheet(entries) {
  const months = [...new Set(entries.map((entry) => entry.month))].sort();

  const costs = [];
  for (const [category, subcategories] of Object.entries(CATEGORIES.cost)) {
    for (const subcategory of subcategories) {
      const rowEntries = entries.filter(
        (entry) =>
          entry.type === "cost" &&
          entry.category === category &&
          entry.subcategory === subcategory,
      );
      const kind = category === "salaries" ? "salaries" : "cost";
      costs.push({ category, subcategory, cells: buildCells(rowEntries, months, kind) });
    }
  }

  const earnings = CATEGORIES.revenue.sales.map((subcategory) => ({
    subcategory,
    cells: buildCells(
      entries.filter((entry) => entry.type === "revenue" && entry.subcategory === subcategory),
      months,
      "earnings",
    ),
  }));

  const totals = {};
  for (const month of months) {
    const { totalCosts, totalRevenue, netProfit, profitMargin, customers } = getSummary(
      entries,
      month,
    );
    totals[month] = { totalCosts, totalRevenue, netProfit, profitMargin, customers };
  }

  return { months, costs, earnings, totals };
}

module.exports = { getSheet, buildCell };
