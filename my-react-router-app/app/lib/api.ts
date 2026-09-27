import type { Cell, Costs, Entry, HistoryRow, Revenue, Sheet, Summary } from "./types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(
      `Can't reach the backend at ${API_URL}. Start it with: cd Backend; npm start`,
      0,
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(body?.error ?? `Request failed with status ${response.status}`, response.status);
  }
  return body as T;
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getSummary = (month: string) => request<Summary>(`/api/summary?month=${month}`);
export const getHistory = () => request<HistoryRow[]>("/api/history");
export const getCosts = (month: string) => request<Costs>(`/api/costs?month=${month}`);
export const getRevenue = (month: string) => request<Revenue>(`/api/revenue?month=${month}`);
export const createEntry = (body: Record<string, unknown>) => request<Entry>("/api/entries", json(body));
export const deleteEntry = (id: number) =>
  request<{ deleted: number }>(`/api/entries/${id}`, { method: "DELETE" });
export const resetData = (mode: "empty" | "demo") =>
  request<{ mode: string; entries: number }>("/api/data/reset", json({ mode }));

export const getSheet = () => request<Sheet>("/api/sheet");
export const setSheetCell = (
  month: string,
  category: string,
  subcategory: string,
  body: Record<string, unknown>,
) =>
  request<{ month: string; category: string; subcategory: string; cell: Cell }>(
    `/api/sheet/${month}/${category}/${subcategory}`,
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
export const copyMonth = (from: string, to: string) =>
  request<{ month: string; copied: number }>("/api/sheet/months", json({ from, to }));
