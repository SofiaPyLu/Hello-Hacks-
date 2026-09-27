const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { resetData } = require("../src/reset");

let dataFile;
let previousDataFile;

test.before(() => {
  previousDataFile = process.env.DATA_FILE;
  dataFile = path.join(os.tmpdir(), `backend-reset-${process.pid}.json`);
  process.env.DATA_FILE = dataFile;
});

test.after(() => {
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  if (previousDataFile === undefined) delete process.env.DATA_FILE;
  else process.env.DATA_FILE = previousDataFile;
});

test("empty leaves 0 entries", () => {
  assert.deepEqual(resetData("empty"), { mode: "empty", entries: 0 });
});

test("demo leaves 192 entries", () => {
  assert.deepEqual(resetData("demo"), { mode: "demo", entries: 192 });
});

test("bogus mode throws", () => {
  assert.throws(() => resetData("bogus"), /empty/);
});
