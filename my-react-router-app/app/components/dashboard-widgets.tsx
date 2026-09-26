import { Icon } from "./icon";

const transactions = [
  { name: "Food", category: "Groceries · Visa ending 2847", date: "Today, 10:42 AM", amount: "−$86.40", incoming: false, initials: "W", tone: "orange" },
  { name: "Employee Salary", category: "Income · Direct deposit", date: "Today, 8:15 AM", amount: "+$4,850.00", incoming: true, initials: "A", tone: "mint" },
  { name: "Utilities", category: "Rent, electricity, water, etc. · Visa ending 2847", date: "Yesterday", amount: "−$10.99", incoming: false, initials: "S", tone: "green" },
  { name: "Hidden costs", category: "Damages, stolen items, etc. · Visa ending 2847", date: "Sep 22, 2026", amount: "−$248.00", incoming: false, initials: "A", tone: "rose" },
];

export function BalanceCard() {
  return (
    <section aria-label="Account balance" className="balance-card">
      <div className="balance-topline">
        <div><span className="balance-label">Total balance</span><span className="balance-account">Main account · USD <span className="balance-chevron">⌄</span></span></div>
        <span className="balance-chip"><span /> Active</span>
      </div>
      <p className="balance-amount">$12,030<span>.00</span><small>USD</small></p>
      <p className="balance-change"><span>↗ 12.8%</span> <span>vs. last month</span></p>
      <div className="balance-bottom">
        <div className="balance-actions">
          <button className="balance-action primary-action"><Icon name="send" /> Transfer</button>
          <button className="balance-action"><Icon name="arrowDown" /> Request</button>
          <button className="balance-action"><Icon name="plus" /> Deposit</button>
        </div>
        <div aria-label="Balance trend over the last week" className="balance-sparkline">
          {[28, 39, 34, 50, 42, 66, 56, 75, 61, 84, 70, 96, 78, 100].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransactionsList() {
  return (
    <section className="content-panel transactions-panel">
      <div className="panel-heading">
        <div><h2>Recent transactions</h2><p>Your latest account activity</p></div>
        <a className="text-link" href="/transactions">View all <Icon name="chevron" /></a>
      </div>
      <div className="transaction-table">
        {transactions.map((transaction) => (
          <article className="transaction-row" key={`${transaction.name}-${transaction.date}`}>
            <span className={`transaction-avatar ${transaction.tone}`}>{transaction.initials}</span>
            <div className="transaction-details"><strong>{transaction.name}</strong><span>{transaction.category}</span></div>
            <time className="transaction-date">{transaction.date}</time>
            <strong className={`transaction-amount${transaction.incoming ? " is-incoming" : ""}`}>{transaction.amount}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PromoCard() {
  return (
    <section className="promo-card">
      <div className="promo-copy"><span className="promo-eyebrow">GROW TOGETHER</span><h2>Good things<br />are better shared.</h2><p>Invite a friend and you could both get $600.</p><button className="promo-button">Invite a friend <Icon name="arrowUp" /></button></div>
      <div aria-hidden="true" className="promo-art"><span className="promo-ring ring-one" /><span className="promo-ring ring-two" /><span className="promo-token">$</span><span className="promo-spark">✳</span></div>
    </section>
  );
}

export function BudgetCard() {
  return (
    <section className="content-panel budget-panel">
      <div className="panel-heading"><div><h2>Overall budget</h2><p>September 2026</p></div><button aria-label="Budget options" className="more-button">···</button></div>
      <div className="budget-amount-line"><span>Total budget</span><strong>$6,000<span> / $8,500</span></strong></div>
      <div aria-label="71 percent of monthly budget used" className="budget-track" role="progressbar" aria-valuenow={71} aria-valuemin={0} aria-valuemax={100}><span /></div>
      <div className="budget-foot"><span><i /> Spent this month</span><strong>$6,000</strong></div>
      <div className="budget-foot remaining"><span><i /> Left to spend</span><strong>$2,500</strong></div>
      <div className="budget-category"><span className="category-icon"><Icon name="card" /></span><span><strong>Daily expenses</strong><small>Food, transport & more</small></span><span className="category-total">$2,340</span></div>
      <div className="budget-category"><span className="category-icon category-icon-lime"><Icon name="home" /></span><span><strong>Home & bills</strong><small>Rent, utilities</small></span><span className="category-total">$2,100</span></div>
    </section>
  );
}