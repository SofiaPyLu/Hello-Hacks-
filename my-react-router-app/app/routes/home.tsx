import { useRouteError } from "react-router";

import type { Route } from "./+types/home";
import { BackendError } from "../components/backend-error";
import { MonthPicker } from "../components/month-picker";
import { HealthCard } from "../components/home/health-card";
import { MonthActivity } from "../components/home/month-activity";
import { RevenueCard } from "../components/home/revenue-card";
import { RevenueExpenseChart } from "../components/home/revenue-expense-chart";
import { getHistory, getRevenue, getSummary } from "../lib/api";
import { resolveMonth } from "../lib/month";
import "../styles/home.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EZ Money | Overview" },
    { name: "description", content: "Your money, moving in sync." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const history = await getHistory();
  const month = resolveMonth(request, history);
  const [summary, revenue] = await Promise.all([getSummary(month), getRevenue(month)]);
  return { month, history, summary, revenue };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <section className="content-panel empty-state-panel">
      <h3>Loading your numbers…</h3>
      <p>Reading this month's costs and earnings.</p>
    </section>
  );
}

export function ErrorBoundary() {
  return <BackendError error={useRouteError()} />;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { month, history, summary, revenue } = loaderData;

  return (
    <div className="overview-page">
      <div className="overview-main-column">
        <div className="home-toolbar"><MonthPicker month={month} /></div>
        <RevenueCard history={history} month={month} />
        <RevenueExpenseChart history={history} month={month} />
        <MonthActivity month={month} revenue={revenue} summary={summary} />
      </div>
      <aside className="overview-side-column">
        <HealthCard summary={summary} />
      </aside>
    </div>
  );
}
