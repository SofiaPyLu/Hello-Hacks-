const test = require("node:test");
const assert = require("node:assert/strict");
const septemberFixture = require("./fixtures/september.json");
const { getCostsForMonth } = require("../src/processors/costProcessor");

test("calculates September cost totals and groups", () => {
  const result = getCostsForMonth(septemberFixture, "2026-09");
  assert.equal(result.total, 34700);
  assert.equal(result.byCategory.utilities, 5200);
  assert.equal(result.byCategory.food, 12600);
  assert.equal(result.byCategory.salaries, 15600);
  assert.equal(result.byCategory.hidden, 1300);
  assert.equal(result.bySubcategory.hidden.other, 0);
  assert.deepEqual(result.staff.waiter, { count: 4, payPerPerson: 1800 });
  assert.deepEqual(result.staff.chef, { count: 2, payPerPerson: 3200 });
  assert.equal(result.entries.length, 13);
});

test("returns initialized zero totals for an empty month", () => {
  const result = getCostsForMonth(septemberFixture, "2030-01");
  assert.equal(result.total, 0);
  assert.equal(result.bySubcategory.food.meats, 0);
  assert.deepEqual(result.staff.chef, { count: 0, payPerPerson: null });
  assert.equal(result.entries.length, 0);
});

test("sums multiple entries in the same subcategory", () => {
  const entries = [
    { id: 2, month: "2026-09", type: "cost", category: "food", subcategory: "meats", amount: 2400 },
    { id: 1, month: "2026-09", type: "cost", category: "food", subcategory: "meats", amount: 3000 },
  ];
  const result = getCostsForMonth(entries, "2026-09");
  assert.equal(result.bySubcategory.food.meats, 5400);
  assert.deepEqual(result.entries.map((entry) => entry.id), [1, 2]);
});

test("ignores revenue entries", () => {
  const result = getCostsForMonth(septemberFixture, "2026-09");
  assert.equal(result.entries.length, 13);
  assert.equal(result.total, 34700);
});
