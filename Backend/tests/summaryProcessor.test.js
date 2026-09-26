const test = require("node:test");
const assert = require("node:assert/strict");
const { THRESHOLDS } = require("../src/constants");
const septemberFixture = require("./fixtures/september.json");
const { getStatus, getSummary, getHistory } = require("../src/processors/summaryProcessor");

test("getStatus applies green and yellow thresholds inclusively", () => {
  assert.equal(getStatus(35, THRESHOLDS.foodCostPercent), "green");
  assert.equal(getStatus(35.1, THRESHOLDS.foodCostPercent), "yellow");
  assert.equal(getStatus(40, THRESHOLDS.foodCostPercent), "yellow");
  assert.equal(getStatus(40.1, THRESHOLDS.foodCostPercent), "red");
  assert.equal(getStatus(null, THRESHOLDS.foodCostPercent), null);
});

test("getSummary computes September totals and ratios", () => {
  const summary = getSummary(septemberFixture, "2026-09");
  assert.equal(summary.totalRevenue, 42000);
  assert.equal(summary.totalCosts, 34700);
  assert.equal(summary.netProfit, 7300);
  assert.equal(summary.profitMargin, 17.4);
  assert.equal(summary.customers, 1400);
  assert.equal(summary.avgSpendPerCustomer, 30);
  assert.equal(summary.costsByCategory.food, 12600);
  assert.equal(summary.costsByCategory.salaries, 15600);
  assert.deepEqual(summary.ratios.foodCostPercent, { value: 30, status: "green" });
  assert.deepEqual(summary.ratios.laborCostPercent, { value: 37.1, status: "yellow" });
  assert.deepEqual(summary.ratios.primeCostPercent, { value: 67.1, status: "yellow" });
});

test("getSummary returns null ratios and averages when revenue is zero", () => {
  const summary = getSummary(septemberFixture, "2030-01");
  assert.equal(summary.totalRevenue, 0);
  assert.equal(summary.totalCosts, 0);
  assert.equal(summary.netProfit, 0);
  assert.equal(summary.profitMargin, null);
  assert.equal(summary.avgSpendPerCustomer, null);
  assert.deepEqual(summary.ratios.foodCostPercent, { value: null, status: null });
  assert.deepEqual(summary.ratios.laborCostPercent, { value: null, status: null });
});

test("getSummary supports loss months", () => {
  const entries = [
    { month: "2026-09", type: "cost", category: "utilities", amount: 10000 },
    { month: "2026-09", type: "revenue", category: "sales", amount: 8000, customers: 100 },
  ];
  const summary = getSummary(entries, "2026-09");
  assert.equal(summary.netProfit, -2000);
  assert.ok(summary.profitMargin < 0);
});

test("getHistory sorts months oldest to newest and omits ratios", () => {
  const entries = [
    { month: "2026-09", type: "revenue", amount: 900, customers: 9 },
    { month: "2026-07", type: "revenue", amount: 700, customers: 7 },
    { month: "2026-08", type: "revenue", amount: 800, customers: 8 },
  ];
  const history = getHistory(entries);
  assert.deepEqual(history.map((item) => item.month), ["2026-07", "2026-08", "2026-09"]);
  assert.ok(history.every((item) => !Object.hasOwn(item, "ratios")));
});

test("getHistory returns an empty array for no entries", () => {
  assert.deepEqual(getHistory([]), []);
});
