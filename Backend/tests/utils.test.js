const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidMonth, previousMonth } = require("../src/utils/month");
const { round1, round2 } = require("../src/utils/round");

test("isValidMonth validates YYYY-MM values", () => {
  assert.equal(isValidMonth("2026-09"), true);
  assert.equal(isValidMonth("2026-13"), false);
  assert.equal(isValidMonth("26-09"), false);
  assert.equal(isValidMonth(""), false);
  assert.equal(isValidMonth(null), false);
});

test("previousMonth returns the preceding month", () => {
  assert.equal(previousMonth("2026-01"), "2025-12");
  assert.equal(previousMonth("2026-09"), "2026-08");
});

test("round1 rounds to one decimal place and handles null", () => {
  assert.equal(round1(67.14), 67.1);
  assert.equal(round1(67.15), 67.2);
  assert.equal(round1(null), null);
});

test("round2 rounds to two decimal places and handles null", () => {
  assert.equal(round2(30.005), 30.01);
  assert.equal(round2(null), null);
});
