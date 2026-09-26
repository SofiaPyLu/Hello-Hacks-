const CATEGORIES = {
  cost: {
    utilities: ["rent", "electricity", "water"],
    hidden: ["maintenance", "furniture-damage", "emergency-reserve", "other"],
    food: ["vegetables", "meats", "beverages", "processed"],
    salaries: ["chef", "waiter", "host"],
  },
  revenue: {
    sales: ["dine-in", "takeout", "delivery"],
  },
};

const THRESHOLDS = {
  foodCostPercent: { green: 35, yellow: 40 },
  laborCostPercent: { green: 35, yellow: 40 },
  primeCostPercent: { green: 65, yellow: 70 },
};

module.exports = { CATEGORIES, THRESHOLDS };
