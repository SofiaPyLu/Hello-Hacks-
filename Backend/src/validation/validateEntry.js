const { CATEGORIES } = require("../constants");
const { isValidMonth } = require("../utils/month");
const { round2 } = require("../utils/round");

function validateEntry(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "request body must be a JSON object" };
  }
  if (!isValidMonth(body.month)) {
    return { ok: false, error: "month is required in format YYYY-MM" };
  }
  if (body.type !== "cost" && body.type !== "revenue") {
    return { ok: false, error: "type must be 'cost' or 'revenue'" };
  }

  const categories = CATEGORIES[body.type];
  if (!Object.prototype.hasOwnProperty.call(categories, body.category)) {
    return {
      ok: false,
      error: `category must be one of: ${Object.keys(categories).join(", ")}`,
    };
  }

  const subcategories = categories[body.category];
  if (!subcategories.includes(body.subcategory)) {
    return {
      ok: false,
      error: `subcategory must be one of: ${subcategories.join(", ")}`,
    };
  }

  const isSalaries = body.category === "salaries";
  let amount;

  if (isSalaries) {
    if (typeof body.count !== "number" || !Number.isInteger(body.count) || body.count < 1) {
      return { ok: false, error: "count must be an integer >= 1" };
    }
    if (typeof body.payPerPerson !== "number" || body.payPerPerson <= 0 || body.payPerPerson > 100000) {
      return { ok: false, error: "payPerPerson must be a number between 0 and 100000" };
    }
    amount = round2(body.count * body.payPerPerson);
  } else {
    if (typeof body.amount !== "number" || body.amount <= 0 || body.amount > 10000000) {
      return { ok: false, error: "amount must be a number greater than 0" };
    }
    amount = body.amount;
  }

  if (body.type === "revenue" && body.customers !== undefined) {
    if (typeof body.customers !== "number" || !Number.isInteger(body.customers) || body.customers < 0) {
      return { ok: false, error: "customers must be an integer >= 0" };
    }
  }

  if (body.note !== undefined && (typeof body.note !== "string" || body.note.length > 200)) {
    return { ok: false, error: "note must be a string of 200 characters or less" };
  }

  const entry = {
    month: body.month,
    type: body.type,
    category: body.category,
    subcategory: body.subcategory,
    amount,
  };
  if (isSalaries) {
    entry.count = body.count;
    entry.payPerPerson = body.payPerPerson;
  }
  if (body.type === "revenue") entry.customers = body.customers ?? 0;
  if (body.note !== undefined) entry.note = body.note;

  return { ok: true, entry };
}

module.exports = { validateEntry };
