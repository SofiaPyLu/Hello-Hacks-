const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const generateSeed = require("../scripts/generateSeed");
const septemberFixture = require("./fixtures/september.json");

let dataFile;
let previousDataFile;

function readSeedEntries() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8")).entries;
}

test.before(() => {
  previousDataFile = process.env.DATA_FILE;
  dataFile = path.join(os.tmpdir(), `backend-seed-${process.pid}.json`);
  process.env.DATA_FILE = dataFile;
  generateSeed();
});

test.after(() => {
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  if (previousDataFile === undefined) delete process.env.DATA_FILE;
  else process.env.DATA_FILE = previousDataFile;
});

test("seed contains the 12 requested distinct months", () => {
  const months = [...new Set(readSeedEntries().map((entry) => entry.month))];
  assert.deepEqual(months, [
    "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
    "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09",
  ]);
});

test("seed has 16 entries per month", () => {
  assert.equal(readSeedEntries().length, 192);
});

test("September entries match the fixture", () => {
  const septemberEntries = readSeedEntries()
    .filter((entry) => entry.month === "2026-09")
    .map(({ id, ...entry }) => entry);
  const fixtureEntries = septemberFixture.map(({ id, ...entry }) => entry);
  assert.deepEqual(septemberEntries, fixtureEntries);
});

test("September cost total is 34700", () => {
  const total = readSeedEntries()
    .filter((entry) => entry.month === "2026-09" && entry.type === "cost")
    .reduce((sum, entry) => sum + entry.amount, 0);
  assert.equal(total, 34700);
});

test("September revenue total is 42000", () => {
  const total = readSeedEntries()
    .filter((entry) => entry.month === "2026-09" && entry.type === "revenue")
    .reduce((sum, entry) => sum + entry.amount, 0);
  assert.equal(total, 42000);
});

test("March maintenance has the repair amount and note", () => {
  const entry = readSeedEntries().find(
    (item) => item.month === "2026-03" && item.subcategory === "maintenance",
  );
  assert.equal(entry.amount, 2400);
  assert.equal(entry.note, "Walk-in fridge compressor repair");
});

test("waiter count changes in June", () => {
  const entries = readSeedEntries();
  assert.equal(entries.find((entry) => entry.month === "2026-05" && entry.subcategory === "waiter").count, 3);
  assert.equal(entries.find((entry) => entry.month === "2026-06" && entry.subcategory === "waiter").count, 4);
});

test("electricity is elevated only for the requested winter months", () => {
  const entries = readSeedEntries();
  assert.equal(entries.find((entry) => entry.month === "2025-12" && entry.subcategory === "electricity").amount, 1100);
  assert.equal(entries.find((entry) => entry.month === "2026-09" && entry.subcategory === "electricity").amount, 900);
});
