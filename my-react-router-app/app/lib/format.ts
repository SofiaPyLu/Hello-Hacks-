export function formatMoney(n: number, decimals = 0) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(n: number | null) {
  return n === null ? "—" : `${n.toFixed(1)}%`;
}

// ponytail: new Date("2026-09") parses as UTC and can slip to August locally.
function monthDate(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1);
}

export function monthLabel(month: string) {
  return monthDate(month).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export function shortMonth(month: string) {
  return monthDate(month).toLocaleDateString("en-CA", { month: "short" });
}
