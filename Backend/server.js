require("dotenv/config");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/costs", require("./src/routes/costs"));
app.use("/api/revenue", require("./src/routes/revenue"));
app.use("/api/summary", require("./src/routes/summary"));
app.use("/api/history", require("./src/routes/history"));
app.use("/api/entries", require("./src/routes/entries"));
app.use("/api/ai-summary", require("./src/routes/aiSummary"));
app.use("/api/data", require("./src/routes/data"));

app.use((req, res) => res.status(404).json({ error: "not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
