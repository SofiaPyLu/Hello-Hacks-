import type { Route } from "./+types/home";
import { BalanceCard, BudgetCard, TransactionsList } from "../components/dashboard-widgets";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EZ Money | Overview" },
    { name: "description", content: "Your money, moving in sync." },
  ];
}

export default function Home() {
  return (
    <div className="overview-page">
      <div className="overview-main-column">
        <BalanceCard />
        <TransactionsList />
      </div>
      <aside className="overview-side-column">
        <BudgetCard />
      </aside>
    </div>
  );
}
