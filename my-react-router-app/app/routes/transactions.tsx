import { useState } from "react";
import { useFetcher, useRouteError } from "react-router";

import type { Route } from "./+types/transactions";
import { BackendError } from "../components/backend-error";
import { Icon } from "../components/icon";
import { MonthPicker } from "../components/month-picker";
import { BreakdownPie, type Slice } from "../components/transactions/breakdown-pie";
import { EntryList } from "../components/transactions/entry-list";
import { TransactionForm } from "../components/transactions/transaction-form";
import { ApiError, createEntry, deleteEntry, getCosts, getHistory, getRevenue, getSummary, resetData } from "../lib/api";
import { COST_META, EARNING_META } from "../lib/categories";
import { formatMoney, monthLabel } from "../lib/format";
import { resolveMonth } from "../lib/month";
import type { CostCategory, EarningCategory } from "../lib/types";
import "../styles/transactions.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EZ Money | Transactions" },
    { name: "description", content: "A clear view of where your money goes." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const history = await getHistory();
  const month = resolveMonth(request, history);
  const [costs, revenue, summary] = await Promise.all([
    getCosts(month),
    getRevenue(month),
    getSummary(month),
  ]);
  return { month, costs, revenue, summary };
}
clientLoader.hydrate = true as const;

type ActionResult = { ok?: boolean; intent?: string; error?: string };

export async function clientAction({ request }: Route.ClientActionArgs): Promise<ActionResult> {
  const form = await request.formData();
  const intent = String(form.get("intent"));

  // FormData is always strings; the backend rejects "900", so everything numeric goes through Number().
  const number = (field: string) => {
    const value = form.get(field);
    return value === null || value === "" ? undefined : Number(value);
  };

  try {
    if (intent === "create") {
      const type = form.get("type") === "revenue" ? "revenue" : "cost";
      const category = type === "revenue" ? "sales" : String(form.get("category"));
      const note = String(form.get("note") ?? "");

      const body: Record<string, unknown> = {
        month: String(form.get("month")),
        type,
        category,
        subcategory: String(form.get("subcategory")),
      };
      if (category === "salaries") {
        body.count = number("count");
        body.payPerPerson = number("payPerPerson");
      } else {
        body.amount = number("amount");
      }
      if (type === "revenue" && number("customers") !== undefined) body.customers = number("customers");
      if (note !== "") body.note = note;

      await createEntry(body);
    } else if (intent === "delete") {
      await deleteEntry(Number(form.get("id")));
    } else if (intent === "reset") {
      await resetData(form.get("mode") === "empty" ? "empty" : "demo");
    }
    return { ok: true, intent };
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
}

export function HydrateFallback() {
  return (
    <section className="content-panel empty-state-panel">
      <h3>Loading your transactions…</h3>
      <p>Reading this month's costs and earnings.</p>
    </section>
  );
}

export function ErrorBoundary() {
  return <BackendError error={useRouteError()} />;
}

function DataPanel() {
  const fetcher = useFetcher();

  const reset = (mode: "empty" | "demo", question: string) => {
    if (!window.confirm(question)) return;
    fetcher.submit({ intent: "reset", mode }, { method: "post" });
  };

  return (
    <section className="content-panel data-panel">
      <div className="panel-heading">
        <div><h2>Your data</h2><p>Start from scratch, or load the demo restaurant</p></div>
      </div>
      <div className="data-actions">
        <button
          className="subtle-button"
          disabled={fetcher.state !== "idle"}
          onClick={() => reset("empty", "Delete every entry? This cannot be undone.")}
          type="button"
        >
          Clear all data
        </button>
        <button
          className="subtle-button"
          disabled={fetcher.state !== "idle"}
          onClick={() => reset("demo", "Replace your data with the demo restaurant?")}
          type="button"
        >
          Load demo data
        </button>
      </div>
    </section>
  );
}

export default function Transactions({ loaderData }: Route.ComponentProps) {
  const { month, costs, revenue, summary } = loaderData;
  const [showForm, setShowForm] = useState(false);

  const isEmptyMonth = costs.entries.length === 0 && revenue.entries.length === 0;

  const costSlices: Slice[] = (Object.keys(COST_META) as CostCategory[]).map((key) => ({
    key,
    label: COST_META[key].label,
    color: COST_META[key].color,
    value: costs.byCategory[key] ?? 0,
  }));
  const earningSlices: Slice[] = (Object.keys(EARNING_META) as EarningCategory[]).map((key) => ({
    key,
    label: EARNING_META[key].label,
    color: EARNING_META[key].color,
    value: revenue.bySubcategory[key] ?? 0,
  }));

  return (
    <div className="section-page">
      <section className="section-summary">
        <div>
          <span className="section-eyebrow">EZ MONEY · {monthLabel(month).toUpperCase()}</span>
          <h2>Your transactions</h2>
          <p>A clear view of where your money goes.</p>
          <div className="transactions-toolbar">
            <MonthPicker month={month} />
            <button className="section-action" onClick={() => setShowForm((open) => !open)} type="button">
              <Icon name="plus" /> Add transaction
            </button>
          </div>
        </div>
        <div className="section-stat is-net-income">
          <strong>{formatMoney(summary.netProfit)}</strong>
          <span>Net income this month</span>
        </div>
      </section>

      <div className="pie-grid">
        <BreakdownPie
          slices={costSlices}
          subtitle="Utilities · Food · Salaries · Hidden costs"
          title="Costs"
          total={costs.total}
        />
        <BreakdownPie
          slices={earningSlices}
          subtitle="Food · Beverages · Orders"
          title="Earnings"
          total={revenue.total}
        />
      </div>

      {showForm || isEmptyMonth ? <TransactionForm month={month} /> : null}

      <EntryList costs={costs.entries} earnings={revenue.entries} />

      <DataPanel />
    </div>
  );
}
