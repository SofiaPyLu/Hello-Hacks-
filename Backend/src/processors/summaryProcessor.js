const { CATEGORIES, THRESHOLDS } = require("../constants");
const { round1, round2 } = require("../utils/round");

function getStatus(value, thresholdObj) {
  if (value === null || value === undefined) return null;
  if (value <= thresholdObj.green) return "green";
  if (value <= thresholdObj.yellow) return "yellow";
  return "red";
}

function getSummary(entries, month) {
  const monthEntries = entries.filter((entry) => entry.month === month);
  const costEntries = monthEntries.filter((entry) => entry.type === "cost");
  const revenueEntries = monthEntries.filter((entry) => entry.type === "revenue");

  const totalRevenue = round2(
    revenueEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
  );
  const totalCosts = round2(
    costEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
  );
  const netProfit = round2(totalRevenue - totalCosts);
  const customers = revenueEntries.reduce(
    (sum, entry) => sum + (Number(entry.customers) || 0),
    0,
  );

  const costsByCategory = {};
  for (const category of Object.keys(CATEGORIES.cost)) {
    costsByCategory[category] = round2(
      costEntries
        .filter((entry) => entry.category === category)
        .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
    );
  }

  const profitMargin = totalRevenue === 0 ? null : round1((netProfit / totalRevenue) * 100);
  const avgSpendPerCustomer = totalRevenue === 0 || customers === 0
    ? null
    : round2(totalRevenue / customers);
  const foodCostPercent = totalRevenue === 0
    ? null
    : round1((costsByCategory.food / totalRevenue) * 100);
  const laborCostPercent = totalRevenue === 0
    ? null
    : round1((costsByCategory.salaries / totalRevenue) * 100);
  const primeCostPercent = totalRevenue === 0
    ? null
    : round1(((costsByCategory.food + costsByCategory.salaries) / totalRevenue) * 100);

  return {
    month,
    totalRevenue,
    totalCosts,
    netProfit,
    profitMargin,
    customers,
    avgSpendPerCustomer,
    costsByCategory,
    ratios: {
      foodCostPercent: {
        value: foodCostPercent,
        status: getStatus(foodCostPercent, THRESHOLDS.foodCostPercent),
      },
      laborCostPercent: {
        value: laborCostPercent,
        status: getStatus(laborCostPercent, THRESHOLDS.laborCostPercent),
      },
      primeCostPercent: {
        value: primeCostPercent,
        status: getStatus(primeCostPercent, THRESHOLDS.primeCostPercent),
      },
    },
  };
}

function getHistory(entries) {
  const months = [...new Set(entries.map((entry) => entry.month))].sort();
  return months.map((month) => {
    const { ratios, ...summary } = getSummary(entries, month);
    return summary;
  });
}

module.exports = { getStatus, getSummary, getHistory };
