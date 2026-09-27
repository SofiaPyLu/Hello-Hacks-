export type CostCategory = "utilities" | "hidden" | "food" | "salaries";
export type EarningCategory = "food" | "beverages" | "orders";
export type Status = "green" | "yellow" | "red" | null;

export type Entry = {
  id: number;
  month: string;
  type: "cost" | "revenue";
  category: string;
  subcategory: string;
  amount: number;
  count?: number;
  payPerPerson?: number;
  customers?: number;
  note?: string;
};

export type RatioKey = "foodCostPercent" | "laborCostPercent" | "primeCostPercent";

export type Summary = {
  month: string;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number | null;
  customers: number;
  avgSpendPerCustomer: number | null;
  costsByCategory: Record<CostCategory, number>;
  ratios: Record<RatioKey, { value: number | null; status: Status }>;
};

export type HistoryRow = Omit<Summary, "ratios">;

export type Costs = {
  month: string;
  total: number;
  byCategory: Record<CostCategory, number>;
  bySubcategory: Record<CostCategory, Record<string, number>>;
  staff: Record<string, { count: number; payPerPerson: number | null }>;
  entries: Entry[];
};

export type Revenue = {
  month: string;
  total: number;
  customers: number;
  avgSpendPerCustomer: number | null;
  bySubcategory: Record<EarningCategory, number>;
  customersBySubcategory: Record<EarningCategory, number>;
  entries: Entry[];
};
