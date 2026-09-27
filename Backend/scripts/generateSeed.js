const fs = require("node:fs");
const path = require("node:path");

const months = [
  "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
  "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09",
];

const september = {
  food: [
    { subcategory: "vegetables", amount: 3000 },
    { subcategory: "meats", amount: 5400 },
    { subcategory: "beverages", amount: 2400 },
    { subcategory: "processed", amount: 1800 },
  ],
  revenue: [
    { subcategory: "food", amount: 26000, customers: 1100 },
    { subcategory: "beverages", amount: 9000, customers: 0 },
    { subcategory: "orders", amount: 7000, customers: 300 },
  ],
};

function generateSeed() {
  const entries = [];
  let id = 1;

  months.forEach((month, monthIndex) => {
    const k = months.length - 1 - monthIndex;
    const factor = Math.pow(0.975, k);
    const add = (entry) => entries.push({ id: id++, month, ...entry });

    add({ type: "cost", category: "utilities", subcategory: "rent", amount: 4000 });
    add({
      type: "cost",
      category: "utilities",
      subcategory: "electricity",
      amount: ["2025-12", "2026-01", "2026-02"].includes(month) ? 1100 : 900,
    });
    add({ type: "cost", category: "utilities", subcategory: "water", amount: 300 });

    add({
      type: "cost",
      category: "hidden",
      subcategory: "maintenance",
      amount: month === "2026-03" ? 2400 : 600,
      ...(month === "2026-03" ? { note: "Walk-in fridge compressor repair" } : {}),
    });
    add({ type: "cost", category: "hidden", subcategory: "furniture-damage", amount: 200 });
    add({ type: "cost", category: "hidden", subcategory: "emergency-reserve", amount: 500 });

    september.food.forEach(({ subcategory, amount }) => {
      add({
        type: "cost",
        category: "food",
        subcategory,
        amount: Math.round((amount * factor) / 10) * 10,
      });
    });

    const waiterCount = month < "2026-06" ? 3 : 4;
    [
      { subcategory: "chef", count: 2, payPerPerson: 3200 },
      { subcategory: "waiter", count: waiterCount, payPerPerson: 1800 },
      { subcategory: "host", count: 1, payPerPerson: 2000 },
    ].forEach(({ subcategory, count, payPerPerson }) => {
      add({
        type: "cost",
        category: "salaries",
        subcategory,
        count,
        payPerPerson,
        amount: count * payPerPerson,
      });
    });

    september.revenue.forEach(({ subcategory, amount, customers }) => {
      add({
        type: "revenue",
        category: "sales",
        subcategory,
        amount: Math.round((amount * factor) / 10) * 10,
        customers: Math.round(customers * factor),
      });
    });
  });

  const dataFile = process.env.DATA_FILE || path.join(__dirname, "..", "data", "data.json");
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify({ entries }, null, 2));
  console.log(`Seed data written: ${entries.length} entries across ${months.length} months`);
  return entries;
}

if (require.main === module) generateSeed();

module.exports = generateSeed;
