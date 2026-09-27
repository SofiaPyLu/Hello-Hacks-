import { COST_CATEGORIES, EARNING_SUBCATEGORIES, SUBCATEGORY_LABELS } from "./categories";
import { formatMoney, formatPercent } from "./format";
import type { CostCategory, Costs, EarningCategory, RatioKey, Revenue, Status } from "./types";

export type Role = "chef" | "waiter" | "host";
export const ROLES: Role[] = ["chef", "waiter", "host"];

export type Levers = {
  staff: Record<Role, number>;
  wagesPct: number;
  pricesPct: number;
  dineInVolumePct: number;
  ordersVolumePct: number;
  ingredientsPct: number;
  utilitiesPct: number;
};

export const NO_CHANGE: Levers = {
  staff: { chef: 0, waiter: 0, host: 0 },
  wagesPct: 0,
  pricesPct: 0,
  dineInVolumePct: 0,
  ordersVolumePct: 0,
  ingredientsPct: 0,
  utilitiesPct: 0,
};

// Mirrors THRESHOLDS in Backend/src/constants.js so both sides judge a ratio the same way.
export const RATIO_TARGETS: Record<RatioKey, { green: number; yellow: number }> = {
  foodCostPercent: { green: 35, yellow: 40 },
  laborCostPercent: { green: 35, yellow: 40 },
  primeCostPercent: { green: 65, yellow: 70 },
};

export function getStatus(value: number | null, target: { green: number; yellow: number }): Status {
  if (value === null) return null;
  if (value <= target.green) return "green";
  if (value <= target.yellow) return "yellow";
  return "red";
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const round1 = (n: number) => Math.round((n + Number.EPSILON) * 10) / 10;
const factor = (percent: number) => 1 + percent / 100;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export type Baseline = {
  month: string;
  earnings: Record<EarningCategory, number>;
  customers: Record<EarningCategory, number>;
  costs: Record<CostCategory, Record<string, number>>;
  staff: Record<Role, { count: number; payPerPerson: number }>;
};

export function buildBaseline(costs: Costs, revenue: Revenue): Baseline {
  const staff = {} as Baseline["staff"];
  for (const role of ROLES) {
    const recorded = costs.staff[role];
    staff[role] = { count: recorded?.count ?? 0, payPerPerson: recorded?.payPerPerson ?? 0 };
  }

  const byCategory = {} as Baseline["costs"];
  for (const category of Object.keys(COST_CATEGORIES) as CostCategory[]) {
    byCategory[category] = { ...costs.bySubcategory[category] };
  }

  const earnings = {} as Record<EarningCategory, number>;
  const customers = {} as Record<EarningCategory, number>;
  for (const channel of EARNING_SUBCATEGORIES) {
    earnings[channel] = revenue.bySubcategory[channel] ?? 0;
    customers[channel] = revenue.customersBySubcategory[channel] ?? 0;
  }

  return { month: costs.month, earnings, customers, staff, costs: byCategory };
}

export type Outcome = {
  earnings: Record<EarningCategory, number>;
  totalRevenue: number;
  costsBySubcategory: Record<CostCategory, Record<string, number>>;
  costsByCategory: Record<CostCategory, number>;
  staff: Record<Role, { count: number; payPerPerson: number; amount: number }>;
  totalCosts: number;
  netProfit: number;
  profitMargin: number | null;
  ratios: Record<RatioKey, { value: number | null; status: Status }>;
};

export function applyScenario(base: Baseline, levers: Levers): Outcome {
  const volume: Record<EarningCategory, number> = {
    food: factor(levers.dineInVolumePct),
    beverages: factor(levers.dineInVolumePct),
    orders: factor(levers.ordersVolumePct),
  };

  // What gets sold, before any price change — this is what the kitchen has to buy for.
  const sold = EARNING_SUBCATEGORIES.map((channel) => base.earnings[channel] * volume[channel]);
  const baseRevenue = sum(EARNING_SUBCATEGORIES.map((channel) => base.earnings[channel]));
  const ingredientVolume = baseRevenue === 0 ? 1 : sum(sold) / baseRevenue;

  const earnings = {} as Record<EarningCategory, number>;
  EARNING_SUBCATEGORIES.forEach((channel, index) => {
    earnings[channel] = round2(sold[index] * factor(levers.pricesPct));
  });

  const staff = {} as Outcome["staff"];
  for (const role of ROLES) {
    const recorded = base.staff[role];
    // A role with no recorded pay has no rate to hire at.
    const count =
      recorded.payPerPerson === 0
        ? recorded.count
        : Math.max(0, recorded.count + levers.staff[role]);
    const payPerPerson = round2(recorded.payPerPerson * factor(levers.wagesPct));
    staff[role] = { count, payPerPerson, amount: round2(count * payPerPerson) };
  }

  const costsBySubcategory = {} as Outcome["costsBySubcategory"];
  for (const category of Object.keys(COST_CATEGORIES) as CostCategory[]) {
    const row: Record<string, number> = {};
    for (const [subcategory, amount] of Object.entries(base.costs[category] ?? {})) {
      if (category === "utilities") {
        row[subcategory] = round2(amount * factor(levers.utilitiesPct));
      } else if (category === "food") {
        row[subcategory] = round2(amount * ingredientVolume * factor(levers.ingredientsPct));
      } else if (category === "salaries") {
        row[subcategory] = staff[subcategory as Role]?.amount ?? amount;
      } else {
        row[subcategory] = amount; // hidden costs ride along unchanged
      }
    }
    costsBySubcategory[category] = row;
  }

  const costsByCategory = {} as Outcome["costsByCategory"];
  for (const category of Object.keys(COST_CATEGORIES) as CostCategory[]) {
    costsByCategory[category] = round2(sum(Object.values(costsBySubcategory[category])));
  }

  const totalRevenue = round2(sum(Object.values(earnings)));
  const totalCosts = round2(sum(Object.values(costsByCategory)));
  const netProfit = round2(totalRevenue - totalCosts);
  const profitMargin = totalRevenue === 0 ? null : round1((netProfit / totalRevenue) * 100);

  const share = (amount: number) =>
    totalRevenue === 0 ? null : round1((amount / totalRevenue) * 100);
  const values: Record<RatioKey, number | null> = {
    foodCostPercent: share(costsByCategory.food),
    laborCostPercent: share(costsByCategory.salaries),
    primeCostPercent: share(costsByCategory.food + costsByCategory.salaries),
  };

  const ratios = {} as Outcome["ratios"];
  for (const key of Object.keys(RATIO_TARGETS) as RatioKey[]) {
    ratios[key] = { value: values[key], status: getStatus(values[key], RATIO_TARGETS[key]) };
  }

  return {
    earnings,
    totalRevenue,
    costsBySubcategory,
    costsByCategory,
    staff,
    totalCosts,
    netProfit,
    profitMargin,
    ratios,
  };
}

export function hasChanges(levers: Levers) {
  return (
    ROLES.some((role) => levers.staff[role] !== 0) ||
    levers.wagesPct !== 0 ||
    levers.pricesPct !== 0 ||
    levers.dineInVolumePct !== 0 ||
    levers.ordersVolumePct !== 0 ||
    levers.ingredientsPct !== 0 ||
    levers.utilitiesPct !== 0
  );
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function phrases(levers: Levers) {
  const parts: string[] = [];

  if (levers.pricesPct !== 0) {
    parts.push(
      levers.pricesPct > 0
        ? `raising prices ${levers.pricesPct}%`
        : `cutting prices ${Math.abs(levers.pricesPct)}%`,
    );
  }
  for (const role of ROLES) {
    const delta = levers.staff[role];
    const noun = SUBCATEGORY_LABELS[role].toLowerCase();
    if (delta > 0) parts.push(`hiring ${plural(delta, noun)}`);
    if (delta < 0) parts.push(`letting ${plural(-delta, noun)} go`);
  }
  if (levers.dineInVolumePct !== 0) {
    parts.push(
      levers.dineInVolumePct > 0
        ? `${levers.dineInVolumePct}% more in-restaurant sales`
        : `${Math.abs(levers.dineInVolumePct)}% fewer in-restaurant sales`,
    );
  }
  if (levers.ordersVolumePct !== 0) {
    parts.push(
      levers.ordersVolumePct > 0
        ? `${levers.ordersVolumePct}% more delivery & takeout`
        : `${Math.abs(levers.ordersVolumePct)}% less delivery & takeout`,
    );
  }
  if (levers.ingredientsPct !== 0) {
    const direction = levers.ingredientsPct > 0 ? "up" : "down";
    parts.push(`ingredient prices ${direction} ${Math.abs(levers.ingredientsPct)}%`);
  }
  if (levers.wagesPct !== 0) {
    const direction = levers.wagesPct > 0 ? "up" : "down";
    parts.push(`wages ${direction} ${Math.abs(levers.wagesPct)}%`);
  }
  if (levers.utilitiesPct !== 0) {
    const direction = levers.utilitiesPct > 0 ? "up" : "down";
    parts.push(`rent & utilities ${direction} ${Math.abs(levers.utilitiesPct)}%`);
  }
  return parts;
}

function joinPhrases(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function describeScenario(levers: Levers, current: Outcome, scenario: Outcome) {
  const parts = phrases(levers);
  if (parts.length === 0) return "No changes yet — adjust a lever to see its effect.";

  const sentence = joinPhrases(parts);
  const opening = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  const difference = round2(scenario.netProfit - current.netProfit);

  const effect =
    difference === 0
      ? "would leave monthly profit unchanged"
      : `would ${difference > 0 ? "lift" : "cut"} monthly profit by ${formatMoney(Math.abs(difference))}`;

  const margins = `margin ${formatPercent(current.profitMargin)} → ${formatPercent(scenario.profitMargin)}`;
  return `${opening} ${effect} (${margins}).`;
}
