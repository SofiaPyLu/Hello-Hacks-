const test = require("node:test");
const assert = require("node:assert/strict");
const septemberFixture = require("./fixtures/september.json");
const { getSheet } = require("../src/processors/sheetProcessor");

const findCost = (sheet, subcategory) =>
  sheet.costs.find((row) => row.subcategory === subcategory);

test("lays out every row and only the months that have entries", () => {
  const sheet = getSheet(septemberFixture);
  assert.deepEqual(sheet.months, ["2026-09"]);
  assert.equal(sheet.costs.length, 14);
  assert.equal(sheet.earnings.length, 3);
});

test("a plain cost cell carries amount and entry count", () => {
  const sheet = getSheet(septemberFixture);
  assert.deepEqual(findCost(sheet, "rent").cells["2026-09"], { amount: 4000, entries: 1 });
});

test("a salaries cell carries count and payPerPerson", () => {
  const cell = findCost(getSheet(septemberFixture), "chef").cells["2026-09"];
  assert.equal(cell.amount, 6400);
  assert.equal(cell.count, 2);
  assert.equal(cell.payPerPerson, 3200);
});

test("an earnings cell carries customers", () => {
  const sheet = getSheet(septemberFixture);
  const food = sheet.earnings.find((row) => row.subcategory === "food");
  assert.equal(food.cells["2026-09"].amount, 26000);
  assert.equal(food.cells["2026-09"].customers, 1100);
});

test("totals reuse the summary numbers", () => {
  const totals = getSheet(septemberFixture).totals["2026-09"];
  assert.equal(totals.totalCosts, 34700);
  assert.equal(totals.totalRevenue, 42000);
  assert.equal(totals.netProfit, 7300);
  assert.equal(totals.profitMargin, 17.4);
});

test("two entries in one month and subcategory are summed", () => {
  const entries = [
    ...septemberFixture,
    { id: 17, month: "2026-09", type: "cost", category: "food", subcategory: "meats", amount: 600 },
  ];
  const cell = findCost(getSheet(entries), "meats").cells["2026-09"];
  assert.equal(cell.amount, 6000);
  assert.equal(cell.entries, 2);
});

test("an empty ledger still has every row, with no months", () => {
  const sheet = getSheet([]);
  assert.deepEqual(sheet.months, []);
  assert.equal(sheet.costs.length + sheet.earnings.length, 17);
  assert.deepEqual(sheet.totals, {});
  assert.deepEqual(findCost(sheet, "rent").cells, {});
});
