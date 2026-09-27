import type { CostCategory, EarningCategory } from "./types";

export const COST_CATEGORIES: Record<CostCategory, string[]> = {
  utilities: ["rent", "electricity", "water"],
  hidden: ["maintenance", "furniture-damage", "emergency-reserve", "other"],
  food: ["vegetables", "meats", "beverages", "processed"],
  salaries: ["chef", "waiter", "host"],
};

export const EARNING_SUBCATEGORIES: EarningCategory[] = ["food", "beverages", "orders"];

type Meta = { label: string; color: string; tone: string };

export const COST_META: Record<CostCategory, Meta> = {
  utilities: { label: "Utilities", color: "#32734e", tone: "cost-utilities" },
  food: { label: "Food inventory", color: "#a76624", tone: "cost-food" },
  salaries: { label: "Salaries", color: "#496991", tone: "cost-salary" },
  hidden: { label: "Hidden costs", color: "#a95f5d", tone: "cost-hidden" },
};

export const EARNING_META: Record<EarningCategory, Meta> = {
  food: { label: "Food", color: "#367a4b", tone: "earning-food" },
  beverages: { label: "Beverages", color: "#788233", tone: "earning-beverage" },
  orders: { label: "Delivery & takeout orders", color: "#387e77", tone: "earning-delivery" },
};

export const SUBCATEGORY_LABELS: Record<string, string> = {
  rent: "Rent",
  electricity: "Electricity",
  water: "Water",
  maintenance: "Maintenance",
  "furniture-damage": "Furniture damage",
  "emergency-reserve": "Emergency reserve",
  other: "Other",
  vegetables: "Vegetables",
  meats: "Meats",
  beverages: "Beverages",
  processed: "Processed",
  chef: "Chef",
  waiter: "Waiter",
  host: "Host",
  food: "Food",
  orders: "Delivery & takeout orders",
};

export const CHART_COLORS = {
  revenue: "#5DC07E",
  costs: "#a95f5d",
  margin: "#173f32",
  grid: "#dfe9e5",
  axis: "#7a8885",
};
