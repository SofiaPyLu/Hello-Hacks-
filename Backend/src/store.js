const fs = require("node:fs");
const path = require("node:path");

function getDataFilePath() {
  return process.env.DATA_FILE || path.join(__dirname, "..", "data", "data.json");
}

function readEntries() {
  const dataFilePath = getDataFilePath();
  if (!fs.existsSync(dataFilePath)) {
    console.log("No data file found. Run: npm run seed");
    return [];
  }
  const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  return data.entries;
}

function writeEntries(entries) {
  const dataFilePath = getDataFilePath();
  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  fs.writeFileSync(dataFilePath, JSON.stringify({ entries }, null, 2));
}

function addEntry(entryWithoutId) {
  const entries = readEntries();
  const id = Math.max(...entries.map((entry) => Number(entry.id)), 0) + 1;
  const savedEntry = { ...entryWithoutId, id };
  entries.push(savedEntry);
  writeEntries(entries);
  return savedEntry;
}

function updateEntry(id, entryWithoutId) {
  const entries = readEntries();
  const index = entries.findIndex((entry) => Number(entry.id) === Number(id));
  if (index === -1) return null;

  const updatedEntry = { ...entryWithoutId, id: entries[index].id };
  entries[index] = updatedEntry;
  writeEntries(entries);
  return updatedEntry;
}

function deleteEntry(id) {
  const entries = readEntries();
  const filteredEntries = entries.filter((entry) => Number(entry.id) !== Number(id));
  if (filteredEntries.length === entries.length) return false;
  writeEntries(filteredEntries);
  return true;
}

module.exports = { readEntries, writeEntries, addEntry, updateEntry, deleteEntry };
