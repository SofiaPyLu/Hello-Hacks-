const { CATEGORIES } = require("../constants");
const { round2 } = require("../utils/round");

function getRevenueForMonth(entries, month) {
  const matchingEntries = entries
    .filter((entry) => entry.type === "revenue" && entry.month === month)
    .sort((a, b) => Number(a.id) - Number(b.id));

  const subcategories = CATEGORIES.revenue.sales;
  const bySubcategory = Object.fromEntries(subcategories.map((subcategory) => [subcategory, 0]));
  const customersBySubcategory = Object.fromEntries(subcategories.map((subcategory) => [subcategory, 0]));

  for (const entry of matchingEntries) {
    if (Object.hasOwn(bySubcategory, entry.subcategory)) {
      bySubcategory[entry.subcategory] = round2(
        bySubcategory[entry.subcategory] + (Number(entry.amount) || 0),
      );
      customersBySubcategory[entry.subcategory] += Number(entry.customers) || 0;
    }
  }

  const total = round2(
    matchingEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0),
  );
  const customers = matchingEntries.reduce(
    (sum, entry) => sum + (Number(entry.customers) || 0),
    0,
  );

  return {
    month,
    total,
    customers,
    avgSpendPerCustomer: customers === 0 ? null : round2(total / customers),
    bySubcategory,
    customersBySubcategory,
    entries: matchingEntries,
  };
}

module.exports = { getRevenueForMonth };
