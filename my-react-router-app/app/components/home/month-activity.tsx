import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router";

import { Icon } from "../icon";
import { COST_META, EARNING_META } from "../../lib/categories";
import { formatMoney } from "../../lib/format";
import type { CostCategory, EarningCategory, Revenue, Summary } from "../../lib/types";

type Row = { key: string; label: string; tone: string; amount: number };

export function MonthActivity({
  month,
  summary,
  revenue,
}: {
  month: string;
  summary: Summary;
  revenue: Revenue;
}) {
  const [activeTab, setActiveTab] = useState<"costs" | "earnings">("costs");
  const isCosts = activeTab === "costs";

  const costRows: Row[] = (Object.keys(COST_META) as CostCategory[]).map((key) => ({
    key,
    label: COST_META[key].label,
    tone: COST_META[key].tone,
    amount: summary.costsByCategory[key] ?? 0,
  }));
  const earningRows: Row[] = (Object.keys(EARNING_META) as EarningCategory[]).map((key) => ({
    key,
    label: EARNING_META[key].label,
    tone: EARNING_META[key].tone,
    amount: revenue.bySubcategory[key] ?? 0,
  }));
  const rows = isCosts ? costRows : earningRows;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = isCosts ? "earnings" : "costs";
    setActiveTab(nextTab);
    document.getElementById(`${nextTab}-tab`)?.focus();
  };

  return (
    <section className="content-panel transactions-panel">
      <div className="panel-heading">
        <div><h2>Earnings &amp; costs</h2><p>Keep track of money coming in and going out</p></div>
        <Link className="text-link" to={`/transactions?month=${month}`}>View all <Icon name="chevron" /></Link>
      </div>
      <div aria-label="Choose earnings or costs" className="activity-tabs" role="tablist">
        <button
          aria-controls="activity-panel"
          aria-selected={isCosts}
          className={`activity-tab${isCosts ? " is-active" : ""}`}
          id="costs-tab"
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab("costs")}
          role="tab"
          tabIndex={isCosts ? 0 : -1}
          type="button"
        >
          Costs <span>{formatMoney(summary.totalCosts, 2)}</span>
        </button>
        <button
          aria-controls="activity-panel"
          aria-selected={!isCosts}
          className={`activity-tab${!isCosts ? " is-active" : ""}`}
          id="earnings-tab"
          onKeyDown={handleTabKeyDown}
          onClick={() => setActiveTab("earnings")}
          role="tab"
          tabIndex={!isCosts ? 0 : -1}
          type="button"
        >
          Earnings <span>{formatMoney(summary.totalRevenue, 2)}</span>
        </button>
      </div>
      <div className="transaction-table">
        <div
          aria-labelledby={isCosts ? "costs-tab" : "earnings-tab"}
          className="activity-tabpanel"
          id="activity-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="activity-total">
            <span>{isCosts ? "Total costs this month" : "Total revenue this month"}</span>
            <strong className={isCosts ? "is-cost" : "is-incoming"}>
              {formatMoney(isCosts ? summary.totalCosts : summary.totalRevenue, 2)}
            </strong>
          </div>
          {rows.map((row) => (
            <article className="transaction-row" key={row.key}>
              <span className={`transaction-avatar ${row.tone}`}>{row.label.charAt(0)}</span>
              <div className="transaction-details"><strong>{row.label}</strong><span>{isCosts ? "Cost" : "Revenue"}</span></div>
              <strong className={`transaction-amount${isCosts ? " is-cost" : " is-incoming"}`}>
                {isCosts ? "−" : "+"}{formatMoney(row.amount, 2)}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
