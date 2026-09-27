function isValidMonth(str) {
  return typeof str === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(str);
}

function previousMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const previousYear = monthNumber === 1 ? year - 1 : year;
  const previousMonthNumber = monthNumber === 1 ? 12 : monthNumber - 1;
  return `${previousYear}-${String(previousMonthNumber).padStart(2, "0")}`;
}

module.exports = { isValidMonth, previousMonth };
