import { useState, type KeyboardEvent } from "react";
import { useFetcher } from "react-router";

import { COST_META, EARNING_META, SUBCATEGORY_LABELS } from "../../lib/categories";
import { formatMoney } from "../../lib/format";
import type { CostCategory, EarningCategory, Entry } from "../../lib/types";

function DeleteButton({ entry }: { entry: Entry }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("Delete this entry?")) event.preventDefault();
      }}
    >
      <input name="intent" type="hidden" value="delete" />
      <input name="id" type="hidden" value={entry.id} />
      <button
        aria-label={`Delete ${SUBCATEGORY_LABELS[entry.subcategory] ?? entry.subcategory}`}
        className="row-delete"
        disabled={fetcher.state !== "idle"}
        type="submit"
      >
        ×
      </button>
    </fetcher.Form>
  );
}

function EntryRow({ entry, isCost }: { entry: Entry; isCost: boolean }) {
  const meta = isCost
    ? COST_META[entry.category as CostCategory]
    : EARNING_META[entry.subcategory as EarningCategory];
  const label = SUBCATEGORY_LABELS[entry.subcategory] ?? entry.subcategory;
  const detail =
    entry.category === "salaries" && entry.count
      ? `${entry.count} × ${formatMoney(entry.payPerPerson ?? 0)}`
      : meta?.label ?? entry.category;

  return (
    <article className="transaction-row">
      <span className={`transaction-avatar ${meta?.tone ?? ""}`}>{label.charAt(0)}</span>
      <div className="transaction-details">
        <strong>{label}</strong>
        <span>{entry.note ? `${detail} · ${entry.note}` : detail}</span>
      </div>
      <strong className={`transaction-amount${isCost ? " is-cost" : " is-incoming"}`}>
        {isCost ? "−" : "+"}{formatMoney(entry.amount, 2)}
      </strong>
      <DeleteButton entry={entry} />
    </article>
  );
}

export function EntryList({ costs, earnings }: { costs: Entry[]; earnings: Entry[] }) {
  const [activeTab, setActiveTab] = useState<"costs" | "earnings">("costs");
  const isCosts = activeTab === "costs";
  const entries = isCosts ? costs : earnings;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = isCosts ? "earnings" : "costs";
    setActiveTab(nextTab);
    document.getElementById(`${nextTab}-entries-tab`)?.focus();
  };

  return (
    <section className="content-panel transactions-panel">
      <div className="panel-heading">
        <div><h2>This month's entries</h2><p>Every cost and earning you recorded</p></div>
      </div>
      <div aria-label="Choose earnings or costs" className="activity-tabs" role="tablist">
        <button
          aria-controls="entries-panel"
          aria-selected={isCosts}
          className={`activity-tab${isCosts ? " is-active" : ""}`}
          id="costs-entries-tab"
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab("costs")}
          role="tab"
          tabIndex={isCosts ? 0 : -1}
          type="button"
        >
          Costs <span>{costs.length}</span>
        </button>
        <button
          aria-controls="entries-panel"
          aria-selected={!isCosts}
          className={`activity-tab${!isCosts ? " is-active" : ""}`}
          id="earnings-entries-tab"
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab("earnings")}
          role="tab"
          tabIndex={!isCosts ? 0 : -1}
          type="button"
        >
          Earnings <span>{earnings.length}</span>
        </button>
      </div>
      <div className="transaction-table">
        <div
          aria-labelledby={isCosts ? "costs-entries-tab" : "earnings-entries-tab"}
          className="activity-tabpanel"
          id="entries-panel"
          role="tabpanel"
          tabIndex={0}
        >
          {entries.length === 0 ? (
            <p className="pie-empty">No {isCosts ? "costs" : "earnings"} recorded for this month.</p>
          ) : (
            entries.map((entry) => <EntryRow entry={entry} isCost={isCosts} key={entry.id} />)
          )}
        </div>
      </div>
    </section>
  );
}
