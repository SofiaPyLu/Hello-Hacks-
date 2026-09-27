const express = require("express");
const { getHistory } = require("../processors/summaryProcessor");
const { readEntries } = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getHistory(readEntries()));
});

module.exports = router;
