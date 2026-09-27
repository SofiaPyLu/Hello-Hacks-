const express = require("express");
const router = express.Router();

const { resetData } = require("../reset");

router.post("/reset", (req, res) => {
  const mode = req.body && req.body.mode;
  if (mode !== "empty" && mode !== "demo") {
    return res.status(400).json({ error: "mode must be 'empty' or 'demo'" });
  }
  res.json(resetData(mode));
});

module.exports = router;
