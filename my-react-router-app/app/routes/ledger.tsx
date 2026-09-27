import { Link, useFetcher, useRouteError } from "react-router";

import type { Route } from "./+types/ledger";
import { BackendError } from "../components/backend-error";
import { Icon } from "../components/icon";
import { LedgerTable } from "../components/ledger/ledger-table";
import { ApiError, copyMonth, getSheet, setSheetCell } from "../lib/api";
import { monthLabel } from "../lib/format";
import { nextMonth } from "../lib/month";
import "../styles/ledger.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EZ Money | Ledger" },
    { name: "description", content: "Every month at a glance." },
  ];
}

export async function clientLoader() {
  return { sheet: await getSheet() };
}
clientLoader.hydrate = true as const;

type ActionResult = { ok?: boolean; intent?: string; error?: string };

export async function clientAction({ request }: Route.ClientActionArgs): Promise<ActionResult> {
  const form = await request.formData();
  const intent = String(form.get("intent"));

  // FormData is always strings and an empty input means "clear this cell", i.e. zero.
  const number = (field: string) => Number(form.get(field) ?? 0) || 0;

  try {
    if (intent === "set-cell") {
      const category = String(form.get("category"));
      const body =
        category === "salaries"
          ? { count: number("count"), payPerPerson: number("payPerPerson") }
          : { amount: number("amount") };

      await setSheetCell(
        String(form.get("month")),
        category,
        String(form.get("subcategory")),
        body,
      );
    } else if (intent === "copy-month") {
      await copyMonth(String(form.get("from")), String(form.get("to")));
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
      <h3>Loading your ledger…</h3>
      <p>Reading every month you have recorded.</p>
    </section>
  );
}

export function ErrorBoundary() {
  return <BackendError error={useRouteError()} />;
}

export default function Ledger({ loaderData }: Route.ComponentProps) {
  const { sheet } = loaderData;
  const fetcher = useFetcher<ActionResult>();

  const latest = sheet.months[sheet.months.length - 1];
  const upcoming = latest ? nextMonth(latest) : null;

  const addMonth = () => {
    if (!latest || !upcoming) return;
    const question = `Create ${monthLabel(upcoming)} as a copy of ${monthLabel(latest)}? You can change the costs after.`;
    if (!window.confirm(question)) return;
    fetcher.submit({ intent: "copy-month", from: latest, to: upcoming }, { method: "post" });
  };

  return (
    <div className="section-page ledger-page">
      <section className="section-summary">
        <div>
          <span className="section-eyebrow">EZ MONEY · MONTHLY LEDGER</span>
          <h2>Your monthly numbers</h2>
          <p>Every month at a glance. Click any cost to change it.</p>
          {upcoming ? (
            <button
              className="section-action ledger-add"
              disabled={fetcher.state !== "idle"}
              onClick={addMonth}
              type="button"
            >
              <Icon name="plus" /> Add {monthLabel(upcoming)}
            </button>
          ) : null}
        </div>
        <div className="section-stat">
          <strong>{sheet.months.length} months</strong>
          <span>Recorded</span>
        </div>
      </section>

      {fetcher.data?.error ? <p className="ledger-error">{fetcher.data.error}</p> : null}

      {sheet.months.length === 0 ? (
        <section className="content-panel empty-state-panel">
          <span className="empty-state-icon"><Icon name="table" /></span>
          <h3>No months recorded yet</h3>
          <p>
            Add your first month on the <Link className="text-link" to="/transactions">Transactions page</Link> —
            you can also load the demo restaurant from there.
          </p>
        </section>
      ) : (
        <LedgerTable sheet={sheet} />
      )}
    </div>
  );
}
