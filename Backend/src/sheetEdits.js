const { CATEGORIES } = require("./constants");
const { isValidMonth } = require("./utils/month");
const { validateEntry } = require("./validation/validateEntry");
const { buildCell } = require("./processors/sheetProcessor");

function cellKind(category) {
  return category === "salaries" ? "salaries" : "cost";
}

function nextId(entries) {
  return Math.max(...entries.map((entry) => Number(entry.id)), 0) + 1;
}

// Looser than validateEntry on purpose: zero is the delete signal, so it never
// reaches validateEntry (which demands amount > 0 and count >= 1).
function validateCellInput({ month, category, subcategory }, body) {
  if (!isValidMonth(month)) {
    return { ok: false, error: "month is required in format YYYY-MM" };
  }
  if (category === "sales") {
    return {
      ok: false,
      error: "earnings are view-only in the ledger — record them on the Transactions page",
    };
  }
  if (!Object.prototype.hasOwnProperty.call(CATEGORIES.cost, category)) {
    return {
      ok: false,
      error: `category must be one of: ${Object.keys(CATEGORIES.cost).join(", ")}`,
    };
  }
  const subcategories = CATEGORIES.cost[category];
  if (!subcategories.includes(subcategory)) {
    return { ok: false, error: `subcategory must be one of: ${subcategories.join(", ")}` };
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "request body must be a JSON object" };
  }

  if (category === "salaries") {
    if (typeof body.count !== "number" || !Number.isInteger(body.count) || body.count < 0) {
      return { ok: false, error: "count must be an integer >= 0" };
    }
    if (body.count === 0) return { ok: true, value: { count: 0, payPerPerson: null } };
    if (
      typeof body.payPerPerson !== "number" ||
      body.payPerPerson <= 0 ||
      body.payPerPerson > 100000
    ) {
      return { ok: false, error: "payPerPerson must be a number between 0 and 100000" };
    }
    return { ok: true, value: { count: body.count, payPerPerson: body.payPerPerson } };
  }

  if (
    typeof body.amount !== "number" ||
    Number.isNaN(body.amount) ||
    body.amount < 0 ||
    body.amount > 10000000
  ) {
    return { ok: false, error: "amount must be a number between 0 and 10000000" };
  }
  return { ok: true, value: { amount: body.amount } };
}

function setCostCell(entries, { month, category, subcategory }, value) {
  const isTarget = (entry) =>
    entry.type === "cost" &&
    entry.month === month &&
    entry.category === category &&
    entry.subcategory === subcategory;

  const removed = entries.filter(isTarget);
  const kept = entries.filter((entry) => !isTarget(entry));
  const kind = cellKind(category);

  const isZero = category === "salaries" ? value.count === 0 : value.amount === 0;
  if (isZero) return { entries: kept, cell: buildCell([], kind) };

  const note = removed.length > 0 ? removed[0].note : undefined;
  const result = validateEntry({
    month,
    type: "cost",
    category,
    subcategory,
    ...value,
    ...(note !== undefined ? { note } : {}),
  });
  if (!result.ok) throw Object.assign(new Error(result.error), { status: 400 });

  const entry = { ...result.entry, id: nextId(entries) };
  return { entries: [...kept, entry], cell: buildCell([entry], kind) };
}

function copyMonth(entries, from, to) {
  const source = entries.filter((entry) => entry.month === from);
  if (source.length === 0) {
    throw Object.assign(new Error(`no entries for ${from}`), { status: 404 });
  }
  if (entries.some((entry) => entry.month === to)) {
    throw Object.assign(new Error(`${to} already has entries`), { status: 409 });
  }

  let id = nextId(entries) - 1;
  const copies = source.map(({ id: _id, note: _note, ...rest }) => ({
    ...rest,
    month: to,
    id: ++id,
  }));
  return { entries: [...entries, ...copies], copied: copies.length };
}

module.exports = { validateCellInput, setCostCell, copyMonth };
