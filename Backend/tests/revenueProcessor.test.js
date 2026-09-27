const test = require("node:test");
const assert = require("node:assert/strict");
const septemberFixture = require("./fixtures/september.json");
const { getRevenueForMonth } = require("../src/processors/revenueProcessor");

test("calculates September revenue and customer totals", () => {
  const result = getRevenueForMonth(septemberFixture, "2026-09");
  assert.equal(result.total, 42000);
  assert.equal(result.customers, 1400);
  assert.equal(result.avgSpendPerCustomer, 30);
  assert.equal(result.bySubcategory.food, 26000);
  assert.equal(result.customersBySubcategory.orders, 300);
  assert.equal(result.entries.length, 3);
});

test("returns zero totals and null average for an empty month", () => {
  const result = getRevenueForMonth(septemberFixture, "2030-01");
  assert.equal(result.total, 0);
  assert.equal(result.customers, 0);
  assert.equal(result.avgSpendPerCustomer, null);
  assert.equal(result.entries.length, 0);
});

test("ignores cost entries", () => {
  const result = getRevenueForMonth(septemberFixture, "2026-09");
  assert.equal(result.entries.length, 3);
  assert.equal(result.total, 42000);
});
