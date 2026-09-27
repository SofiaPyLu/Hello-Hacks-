import { useState, type KeyboardEvent } from "react";
import { Icon } from "./icon";

const costs = [
  { name: "Food", category: "Groceries", date: "Today, 10:42 AM", amount: "−$86.40", initials: "F", tone: "cost-food" },
  { name: "Employee salary", category: "Chef, waiter/waitress, host", date: "Today, 8:15 AM", amount: "−$4,850.00", initials: "E", tone: "cost-salary" },
  { name: "Utilities", category: "Electricity, rent, water", date: "Yesterday", amount: "−$10,099.00", initials: "U", tone: "cost-utilities" },
  { name: "Hidden costs", category: "Emergency reserve, maintenance,  furniture damage", date: "Sep 22, 2026", amount: "−$248.00", initials: "H", tone: "cost-hidden" },
];

const earnings = [
  { name: "Food", category: "Revenue · Main account", date: "Today, 9:28 AM", amount: "+$12,400.00", initials: "F", tone: "earning-food" },
  { name: "Beverage", category: "Revenue · Main account", date: "Sep 23, 2026", amount: "+$5,620.00", initials: "B", tone: "earning-beverage" },
  { name: "Delivery/takeout orders", category: "Revenue · Main account", date: "Sep 21, 2026", amount: "+$400.00", initials: "D", tone: "earning-delivery" },
];

export function BalanceCard() {
  return (
    <section aria-label="Monthly revenue" className="balance-card">
      <div className="balance-topline">
        <div><span className="balance-label">Revenue this month</span><span className="balance-account">September 2026 · CAD</span></div>
        <span className="balance-chip"><span /> Monthly total</span>
      </div>
      <p className="balance-amount">$18,420<span>.00</span><small>CAD</small></p>
      <p className="balance-change"><span>↗ 12.8%</span> <span>vs. last month</span></p>
      <div className="balance-bottom">
        <div aria-label="Revenue trend over the last week" className="balance-sparkline">
          {[28, 39, 34, 50, 42, 66, 56, 75, 61, 84, 70, 96, 78, 100].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransactionsList() {
  const [activeTab, setActiveTab] = useState<"costs" | "earnings">("costs");
  const isCosts = activeTab === "costs";
  const entries = isCosts ? costs : earnings;
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
        <a className="text-link" href="/transactions">View all <Icon name="chevron" /></a>
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
          Costs <span>$15,283.40</span>
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
          Earnings <span>$18,420.00</span>
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
            <strong className={isCosts ? "is-cost" : "is-incoming"}>{isCosts ? "$15,283.40" : "$18,420.00"}</strong>
          </div>
          {entries.map((entry) => (
            <article className="transaction-row" key={`${entry.name}-${entry.date}`}>
              <span className={`transaction-avatar ${entry.tone}`}>{entry.initials}</span>
              <div className="transaction-details"><strong>{entry.name}</strong><span>{entry.category}</span></div>
              <time className="transaction-date">{entry.date}</time>
              <strong className={`transaction-amount${isCosts ? " is-cost" : " is-incoming"}`}>{entry.amount}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BudgetCard() {
  return (
    <section className="content-panel budget-panel">
      <div className="panel-heading"><div><h2>Overall budget</h2><p>September 2026</p></div><button aria-label="Budget options" className="more-button">···</button></div>
      <div className="budget-amount-line"><span>Total budget</span><strong>$15,283.40<span> / $18,000.00</span></strong></div>
      <div aria-label="85 percent of monthly budget used" className="budget-track" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}><span /></div>
      <div className="budget-foot"><span><i /> Spent this month</span><strong>$15,283.40</strong></div>
      <div className="budget-foot remaining"><span><i /> Left to spend</span><strong>$2,716.60</strong></div>
    </section>
  );
}