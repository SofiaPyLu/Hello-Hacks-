const test = require("node:test");
const assert = require("node:assert/strict");
const septemberFixture = require("./fixtures/september.json");
const { validateCellInput, setCostCell, copyMonth } = require("../src/sheetEdits");

const RENT = { month: "2026-09", category: "utilities", subcategory: "rent" };
const isRent = (entry) => entry.category === "utilities" && entry.subcategory === "rent";

test("setting a cell replaces the entry behind it", () => {
  const { entries, cell } = setCostCell(septemberFixture, RENT, { amount: 4200 });
  assert.equal(entries.length, septemberFixture.length);
  assert.equal(entries.filter(isRent).length, 1);
  assert.equal(entries.find(isRent).amount, 4200);
  assert.deepEqual(cell, { amount: 4200, entries: 1 });
});

test("a cell holding two entries collapses to one", () => {
  const doubled = [
    ...septemberFixture,
    { id: 17, month: "2026-09", type: "cost", category: "utilities", subcategory: "rent", amount: 500 },
  ];
  const { entries } = setCostCell(doubled, RENT, { amount: 4200 });
  assert.equal(entries.filter(isRent).length, 1);
  assert.equal(entries.length, doubled.length - 1);
});

test("setting a cell to zero removes the entry", () => {
  const { entries, cell } = setCostCell(septemberFixture, RENT, { amount: 0 });
  assert.equal(entries.filter(isRent).length, 0);
  assert.equal(entries.length, septemberFixture.length - 1);
  assert.deepEqual(cell, { amount: 0, entries: 0 });
});

test("a salaries cell multiplies count by payPerPerson", () => {
  const target = { month: "2026-09", category: "salaries", subcategory: "waiter" };
  const { cell } = setCostCell(septemberFixture, target, { count: 5, payPerPerson: 1800 });
  assert.equal(cell.amount, 9000);
  assert.equal(cell.count, 5);
  assert.equal(cell.payPerPerson, 1800);
});

test("earnings are rejected as view-only", () => {
  const result = validateCellInput(
    { month: "2026-09", category: "sales", subcategory: "food" },
    { amount: 1 },
  );
  assert.equal(result.ok, false);
  assert.match(result.error, /view-only/);
});

test("validateCellInput rejects bad values", () => {
  const bad = (body, target = RENT) => assert.equal(validateCellInput(target, body).ok, false);
  const salaries = { month: "2026-09", category: "salaries", subcategory: "chef" };

  bad({ amount: "900" });
  bad({ amount: -1 });
  bad({ count: 1.5, payPerPerson: 1000 }, salaries);
  bad({ count: 2 }, salaries);
});

test("copyMonth clones a month with fresh ids and no notes", () => {
  const noted = septemberFixture.map((entry) =>
    isRent(entry) ? { ...entry, note: "carried over" } : entry,
  );
  const { entries, copied } = copyMonth(noted, "2026-09", "2026-10");
  const october = entries.filter((entry) => entry.month === "2026-10");

  assert.equal(copied, 16);
  assert.equal(october.length, 16);
  assert.deepEqual(
    october.map((entry) => entry.id),
    Array.from({ length: 16 }, (_, index) => 17 + index),
  );
  assert.ok(october.every((entry) => entry.note === undefined));
});

test("copyMonth refuses a target that already has entries", () => {
  assert.throws(() => copyMonth(septemberFixture, "2026-09", "2026-09"), { status: 409 });
});

test("copyMonth refuses an empty source month", () => {
  assert.throws(() => copyMonth(septemberFixture, "2030-01", "2030-02"), { status: 404 });
});
