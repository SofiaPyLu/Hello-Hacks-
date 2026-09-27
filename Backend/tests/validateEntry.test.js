const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateEntry } = require("../src/validation/validateEntry");

const validCost = {
  month: "2026-09",
  type: "cost",
  category: "food",
  subcategory: "meats",
  amount: 5400,
};
const validSalary = {
  month: "2026-09",
  type: "cost",
  category: "salaries",
  subcategory: "chef",
  count: 2,
  payPerPerson: 3200,
};
const validRevenue = {
  month: "2026-09",
  type: "revenue",
  category: "sales",
  subcategory: "food",
  amount: 26000,
  customers: 1100,
};

test("valid cost", () => {
  const r = validateEntry(validCost);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.entry).sort(), ["amount", "category", "month", "subcategory", "type"]);
});

test("valid salary computes amount", () => {
  const r = validateEntry(validSalary);
  assert.equal(r.ok, true);
  assert.equal(r.entry.amount, 6400);
  assert.equal(r.entry.count, 2);
  assert.equal(r.entry.payPerPerson, 3200);
});

test("salary ignores sent amount", () => {
  const r = validateEntry({ ...validSalary, amount: 9999 });
  assert.equal(r.ok, true);
  assert.equal(r.entry.amount, 6400);
});

test("valid revenue keeps customers", () => {
  const r = validateEntry(validRevenue);
  assert.equal(r.ok, true);
  assert.equal(r.entry.customers, 1100);
});

test("check 1: null body", () => {
  const r = validateEntry(null);
  assert.equal(r.ok, false);
  assert.match(r.error, /JSON object/);
});

test("check 1: string body", () => {
  assert.equal(validateEntry("string").ok, false);
});

test("check 1: array body", () => {
  assert.equal(validateEntry([1, 2]).ok, false);
});

test("check 2: missing month", () => {
  assert.match(validateEntry({ type: "cost" }).error, /YYYY-MM/);
});

test("check 2: bad month", () => {
  assert.match(validateEntry({ month: "bad", type: "cost" }).error, /YYYY-MM/);
});

test("check 3: bad type", () => {
  assert.match(validateEntry({ month: "2026-09", type: "invalid" }).error, /cost/);
});

test("check 4: bad category", () => {
  assert.match(
    validateEntry({ month: "2026-09", type: "cost", category: "invalid" }).error,
    /utilities/
  );
});

test("check 5: bad subcategory", () => {
  assert.match(
    validateEntry({ ...validCost, subcategory: "invalid", amount: undefined }).error,
    /vegetables/
  );
});

test("check 6a: bad count", () => {
  assert.match(validateEntry({ ...validSalary, count: 0 }).error, /count/);
});

test("check 6b: bad payPerPerson", () => {
  assert.match(validateEntry({ ...validSalary, payPerPerson: -1 }).error, /payPerPerson/);
});

test("check 7: negative amount", () => {
  assert.match(validateEntry({ ...validCost, amount: -5 }).error, /amount/);
});

test("check 7: string amount rejected", () => {
  assert.match(validateEntry({ ...validCost, amount: "900" }).error, /amount/);
});

test("check 8: missing customers defaults to 0", () => {
  const r = validateEntry({ ...validRevenue, customers: undefined });
  assert.equal(r.ok, true);
  assert.equal(r.entry.customers, 0);
});

test("check 8: negative customers rejected", () => {
  assert.match(validateEntry({ ...validRevenue, customers: -1 }).error, /customers/);
});

test("check 9: long note", () => {
  assert.match(validateEntry({ ...validCost, note: "x".repeat(201) }).error, /note/);
});

test("strips unknown fields", () => {
  const r = validateEntry({ ...validCost, foo: "bar" });
  assert.equal(r.ok, true);
  assert.equal("foo" in r.entry, false);
});

test("strips id", () => {
  const r = validateEntry({ ...validCost, id: 99 });
  assert.equal(r.ok, true);
  assert.equal("id" in r.entry, false);
});
