const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const express = require("express");

const fixture = require("./fixtures/september.json");

let dataFile;
let server;
let base;
let costsBase;

test.before(async () => {
  dataFile = path.join(os.tmpdir(), `backend-entries-${process.pid}.json`);
  process.env.DATA_FILE = dataFile;
  fs.writeFileSync(dataFile, JSON.stringify({ entries: fixture }, null, 2));

  const app = express();
  app.use(express.json());
  app.use("/api/entries", require("../src/routes/entries"));
  app.use("/api/costs", require("../src/routes/costs"));

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  base = `${origin}/api/entries`;
  costsBase = `${origin}/api/costs`;
});

test.after(() => {
  server.close();
  if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  delete process.env.DATA_FILE;
});

const post = (body) =>
  fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validCost = {
  month: "2026-09",
  type: "cost",
  category: "food",
  subcategory: "meats",
  amount: 500,
};

test("POST valid cost returns 201 with a numeric id", async () => {
  const res = await post(validCost);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(typeof body.id, "number");
});

test("POST missing month returns 400", async () => {
  const res = await post({ ...validCost, month: undefined });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.ok(body.error);
});

test("POST salary computes amount", async () => {
  const res = await post({
    month: "2026-09",
    type: "cost",
    category: "salaries",
    subcategory: "chef",
    count: 2,
    payPerPerson: 3200,
  });
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.amount, 6400);
});

test("POST revenue without customers returns 400", async () => {
  const res = await post({
    month: "2026-09",
    type: "revenue",
    category: "sales",
    subcategory: "dine-in",
    amount: 1000,
  });
  assert.equal(res.status, 400);
});

test("costs total reflects a new entry", async () => {
  // ponytail: delta, not an absolute baseline — earlier tests in this file share the data file.
  const before = await (await fetch(`${costsBase}?month=2026-09`)).json();

  await post(validCost);

  const after = await (await fetch(`${costsBase}?month=2026-09`)).json();
  assert.equal(after.total, before.total + 500);
  assert.equal(after.bySubcategory.food.meats, before.bySubcategory.food.meats + 500);
});

test("PUT with a valid id returns the updated entry", async () => {
  const created = await (await post(validCost)).json();
  const res = await fetch(`${base}/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validCost, amount: 777 }),
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.amount, 777);
  assert.equal(body.id, created.id);
});

test("PUT with a nonexistent id returns 404", async () => {
  const res = await fetch(`${base}/999`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validCost),
  });
  assert.equal(res.status, 404);
});

test("PUT with an invalid id returns 400", async () => {
  const res = await fetch(`${base}/abc`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validCost),
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.match(body.error, /positive integer/);
});

test("DELETE removes the entry, then 404s on a repeat", async () => {
  const created = await (await post(validCost)).json();

  const first = await fetch(`${base}/${created.id}`, { method: "DELETE" });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { deleted: created.id });

  const second = await fetch(`${base}/${created.id}`, { method: "DELETE" });
  assert.equal(second.status, 404);
});
