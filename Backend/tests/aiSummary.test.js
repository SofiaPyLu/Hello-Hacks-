const test = require("node:test");
const assert = require("node:assert/strict");

const fixture = require("./fixtures/september.json");
const { getSummary } = require("../src/processors/summaryProcessor");
const { buildFallbackSummary, generateAiSummary } = require("../src/ai/aiSummary");

delete process.env.AI_API_KEY;

const current = getSummary(fixture, "2026-09");

test("summarizes a month with no previous month", () => {
  const result = buildFallbackSummary(current, null);
  assert.match(result, /42,000/);
  assert.match(result, /7,300/);
  assert.match(result, /Prime cost/);
  assert.match(result, /67\.1%/);
  assert.doesNotMatch(result, /Profit (rose|fell)/);
});

test("reports profit change against a previous month", () => {
  const prev = { ...current, month: "2026-08", netProfit: 6600 };
  const result = buildFallbackSummary(current, prev);
  assert.match(result, /rose/);
  assert.match(result, /700/);
});

test("reports an empty month", () => {
  const result = buildFallbackSummary(
    { month: "2030-01", totalRevenue: 0, totalCosts: 0 },
    null,
  );
  assert.equal(result, "No data available for 2030-01.");
});

test("reports all-green ratios as healthy", () => {
  const healthy = {
    month: "2026-09",
    totalRevenue: 36000,
    totalCosts: 28000,
    netProfit: 8000,
    profitMargin: 22.2,
    ratios: {
      foodCostPercent: { value: 28, status: "green" },
      laborCostPercent: { value: 30, status: "green" },
      primeCostPercent: { value: 58, status: "green" },
    },
  };
  assert.match(buildFallbackSummary(healthy, null), /healthy range/);
});

test("falls back when no API key is configured", async (t) => {
  t.before(() => delete process.env.AI_API_KEY);
  const result = await generateAiSummary("2026-09", fixture);
  assert.equal(result.source, "fallback");
  assert.equal(result.month, "2026-09");
  assert.match(result.summary, /42,000/);
});

test("never throws on an empty month", async () => {
  delete process.env.AI_API_KEY;
  const result = await generateAiSummary("2030-01", []);
  assert.equal(result.source, "fallback");
  assert.equal(result.summary, "No data available for 2030-01.");
});
