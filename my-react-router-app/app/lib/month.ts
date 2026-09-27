import type { HistoryRow } from "./types";

export function resolveMonth(request: Request, history: HistoryRow[]) {
  const requested = new URL(request.url).searchParams.get("month");
  if (requested && /^\d{4}-(0[1-9]|1[0-2])$/.test(requested)) return requested;
  if (history.length > 0) return history[history.length - 1].month;

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
