const { CATEGORIES } = require("../constants");
const { round2 } = require("../utils/round");

function getCostsForMonth(entries, month) {
  const matchingEntries = entries
    .filter((entry) => entry.type === "cost" && entry.month === month)
    .sort((a, b) => Number(a.id) - Number(b.id));

  const byCategory = {};
  const bySubcategory = {};
  for (const [category, subcategories] of Object.entries(CATEGORIES.cost)) {
    byCategory[category] = 0;
    bySubcategory[category] = Object.fromEntries(subcategories.map((subcategory) => [subcategory, 0]));
  }

  const staff = Object.fromEntries(
    CATEGORIES.cost.salaries.map((role) => [role, { count: 0, payPerPerson: null }]),
  );

  for (const entry of matchingEntries) {
    const amount = Number(entry.amount) || 0;
    if (Object.hasOwn(byCategory, entry.category)) {
      byCategory[entry.category] = round2(byCategory[entry.category] + amount);
      if (Object.hasOwn(bySubcategory[entry.category], entry.subcategory)) {
        bySubcategory[entry.category][entry.subcategory] = round2(
          bySubcategory[entry.category][entry.subcategory] + amount,
        );
      }
    }

    if (entry.category === "salaries" && Object.hasOwn(staff, entry.subcategory)) {
      staff[entry.subcategory].count += Number(entry.count) || 0;
    }
  }

  for (const role of CATEGORIES.cost.salaries) {
    const totalAmount = matchingEntries
      .filter((entry) => entry.category === "salaries" && entry.subcategory === role)
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
    const count = staff[role].count;
    staff[role].payPerPerson = count === 0 ? null : round2(totalAmount / count);
  }

  const total = round2(matchingEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0));

  return { month, total, byCategory, bySubcategory, staff, entries: matchingEntries };
}

module.exports = { getCostsForMonth };
