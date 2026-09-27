const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { readEntries, addEntry, updateEntry, deleteEntry } = require("../src/store");

let dataFile;
let tempFiles = 0;

test.beforeEach(() => {
  dataFile = path.join(os.tmpdir(), `backend-store-${process.pid}-${++tempFiles}.json`);
  process.env.DATA_FILE = dataFile;
});

test.afterEach(() => {
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  delete process.env.DATA_FILE;
});

test("readEntries returns an empty array when the file is missing", () => {
  assert.deepEqual(readEntries(), []);
});

test("addEntry assigns id 1 in an empty store", () => {
  const entry = addEntry({ name: "First" });
  assert.deepEqual(entry, { name: "First", id: 1 });
});

test("a second addEntry assigns id 2", () => {
  addEntry({ name: "First" });
  assert.deepEqual(addEntry({ name: "Second" }), { name: "Second", id: 2 });
});

test("addEntry writes entries to disk", () => {
  addEntry({ name: "First" });
  addEntry({ name: "Second" });
  assert.deepEqual(readEntries(), [
    { name: "First", id: 1 },
    { name: "Second", id: 2 },
  ]);
});

test("updateEntry updates a valid id and preserves the id", () => {
  addEntry({ name: "Before" });
  assert.deepEqual(updateEntry(1, { name: "After" }), { name: "After", id: 1 });
});

test("updateEntry returns null for a nonexistent id", () => {
  assert.equal(updateEntry(99, { name: "Missing" }), null);
});

test("deleteEntry removes a valid id", () => {
  addEntry({ name: "Remove me" });
  assert.equal(deleteEntry(1), true);
  assert.deepEqual(readEntries(), []);
});

test("deleteEntry returns false for a nonexistent id", () => {
  assert.equal(deleteEntry(99), false);
});
