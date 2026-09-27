const express = require("express");
const router = express.Router();

router.post("/", (req, res) => res.status(501).json({ error: "not implemented" }));

module.exports = router;
