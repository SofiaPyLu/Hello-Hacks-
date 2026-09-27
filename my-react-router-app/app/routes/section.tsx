import { useLocation } from "react-router";
import { BudgetCard, TransactionsList } from "../components/dashboard-widgets";
import { Icon } from "../components/icon";

const pages: Record<string, { title: string; description: string; stat: string; label: string; action: string }> = {
  "/transactions": { title: "Your transactions", description: "A clear view of where your money goes.", stat: "$3,136.60", label: "Net income this month", action: "Download statement" },
  "/insights": { title: "Your money, in focus", description: "Small insights that make a big difference.", stat: "+12.8%", label: "Balance growth this month", action: "View report" },
  "/recipient": { title: "People you pay", description: "Your trusted recipients, all in one place.", stat: "8 people", label: "Saved recipients", action: "Add recipient" },
  "/scheduled": { title: "Coming up", description: "Keep track of payments on the calendar.", stat: "$1,420.00", label: "Scheduled this month", action: "Schedule payment" },

  "/invoicing": { title: "Simple invoicing", description: "Create and follow up on invoices with ease.", stat: "$3,850.00", label: "Awaiting payment", action: "Create invoice" },
};

export default function SectionPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] ?? pages["/transactions"];

  return (
    <div className="section-page">
      <section className="section-summary">
        <div><span className="section-eyebrow">YOUR FINANCES</span><h2>{page.title}</h2><p>{page.description}</p></div>
        <button className="section-action"><Icon name="plus" /> {page.action}</button>
        <div className={`section-stat${pathname === "/transactions" ? " is-net-income" : ""}`}><strong>{page.stat}</strong><span>{page.label}</span></div>
      </section>
      {pathname === "/transactions" ? <TransactionsList /> : null}
      {pathname === "/insights" ? <BudgetCard /> : null}
      {pathname !== "/transactions" && pathname !== "/insights" ? (
        <section className="content-panel empty-state-panel">
          <span className="empty-state-icon"><Icon name={pathname === "/recipient" ? "users" : pathname === "/scheduled" ? "calendar" : pathname === "/invoicing" ? "file" : "send"} /></span>
          <h3>Everything in one place</h3>
          <p>Your {pathname.replace("/", " ").replace("-", " ")} activity will show here.</p>
          <button className="subtle-button">{page.action}</button>
        </section>
      ) : null}
    </div>
  );
}