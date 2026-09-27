const { writeEntries, readEntries } = require("./store");
const generateSeed = require("../scripts/generateSeed");

function resetData(mode) {
  if (mode === "empty") writeEntries([]);
  else if (mode === "demo") generateSeed();
  else throw new Error("mode must be 'empty' or 'demo'");

  return { mode, entries: readEntries().length };
}

module.exports = { resetData };
