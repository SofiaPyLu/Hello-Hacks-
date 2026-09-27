import { useState } from "react";
import { Link, useRouteError } from "react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Route } from "./+types/forecast";
import { BackendError } from "../components/backend-error";
import { ComparisonTable } from "../components/forecast/comparison-table";
import { LeverPanel } from "../components/forecast/lever-panel";
import { MonthPicker } from "../components/month-picker";
import { getCosts, getHistory, getRevenue } from "../lib/api";
import { formatMoney, formatPercent, monthLabel } from "../lib/format";
import { resolveMonth } from "../lib/month";
import {
  NO_CHANGE,
  applyScenario,
  buildBaseline,
  describeScenario,
  hasChanges,
  type Levers,
  type Outcome,
} from "../lib/scenario";
import "../styles/forecast.css";

const TODAY_COLOR = "#9ab3a8";
const SCENARIO_COLOR = "#207f66";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EZ Money | Forecast" },
    { name: "description", content: "Try changes on a copy of your numbers." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const history = await getHistory();
  const month = resolveMonth(request, history);
  const [costs, revenue] = await Promise.all([getCosts(month), getRevenue(month)]);
  return { month, costs, revenue };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <section className="content-panel empty-state-panel">
      <h3>Loading your numbers…</h3>
      <p>Making a copy you can safely experiment on.</p>
    </section>
  );
}

export function ErrorBoundary() {
  return <BackendError error={useRouteError()} />;
}

export default function Forecast({ loaderData }: Route.ComponentProps) {
  const { month, costs, revenue } = loaderData;
  const isEmptyMonth = costs.entries.length === 0 && revenue.entries.length === 0;

  return (
    <div className="forecast-figma-page">
      <div className="forecast-layout">
        <main className="forecast-workspace">
          <div className="forecast-breadcrumbs">
            <span>Forecasting</span>
            <span className="divider">/</span>
            <span>Nothing here is saved</span>
          </div>

          <div className="forecast-window">
            <header className="forecast-topline">
              <div className="forecast-title-wrap">
                <h1>What if…?</h1>
                <p>Try changes on a copy of your numbers. Nothing here is saved.</p>
              </div>
              <div className="topline-actions starting-from">
                <span className="starting-label">Starting from</span>
                <MonthPicker month={month} />
              </div>
            </header>

            {isEmptyMonth ? (
              <section className="forecast-banner">
                <div>
                  <span className="banner-label">NOTHING TO WORK FROM</span>
                  <h2>{monthLabel(month)} has no entries yet.</h2>
                  <p>
                    Add a month in the <Link to="/ledger">Ledger</Link>, or record earnings and costs
                    on the <Link to="/transactions">Transactions page</Link>, then come back to try
                    changes against it.
                  </p>
                </div>
              </section>
            ) : (
              // Remounting on a month change clears the levers with it.
              <ScenarioWorkspace costs={costs} key={month} month={month} revenue={revenue} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

type WorkspaceProps = {
  month: string;
  costs: Route.ComponentProps["loaderData"]["costs"];
  revenue: Route.ComponentProps["loaderData"]["revenue"];
};

function ScenarioWorkspace({ month, costs, revenue }: WorkspaceProps) {
  const [levers, setLevers] = useState<Levers>(NO_CHANGE);

  const base = buildBaseline(costs, revenue);
  // Both columns run through the same maths so the comparison is honest.
  const current = applyScenario(base, NO_CHANGE);
  const scenario = applyScenario(base, levers);

  const profitChange = scenario.netProfit - current.netProfit;
  const yearlyImpact = profitChange * 12;
  const changed = hasChanges(levers);

  const chartData = [
    { name: "Revenue", today: current.totalRevenue, scenario: scenario.totalRevenue },
    { name: "Costs", today: current.totalCosts, scenario: scenario.totalCosts },
    { name: "Net profit", today: current.netProfit, scenario: scenario.netProfit },
  ];

  return (
    <>
      <section className="forecast-banner scenario-banner">
        <div>
          <span className="banner-label">BASED ON {monthLabel(month).toUpperCase()}</span>
          <h2>{describeScenario(levers, current, scenario)}</h2>
          <p className={`yearly-impact${yearlyImpact < 0 ? " is-down" : " is-up"}`}>
            Yearly impact: {yearlyImpact >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(yearlyImpact))}
          </p>
        </div>
      </section>

      <section className="stats-row">
        <StatCard label="Revenue" scenario={scenario.totalRevenue} today={current.totalRevenue} />
        <StatCard invert label="Costs" scenario={scenario.totalCosts} today={current.totalCosts} />
        <StatCard label="Net profit" scenario={scenario.netProfit} today={current.netProfit} />
        <MarginCard current={current} scenario={scenario} />
      </section>

      <section className="forecast-main-grid">
        <div className="chart-card">
          <div className="chart-header-row">
            <h3 className="chart-title">Today vs your scenario</h3>
            <span className="filter-pill">{changed ? "Scenario applied" : "No changes yet"}</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#dfe9e5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tick={{ fill: "#7a8885", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#7a8885", fontSize: 11 }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #dfe7e2", background: "#fff" }}
                  formatter={(value: number) => formatMoney(value)}
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Bar
                  dataKey="today"
                  fill={TODAY_COLOR}
                  isAnimationActive={false}
                  name="Today"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="scenario"
                  fill={SCENARIO_COLOR}
                  isAnimationActive={false}
                  name="Scenario"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="right-panel">
          <LeverPanel
            base={base}
            current={current}
            levers={levers}
            onChange={setLevers}
            onReset={() => setLevers(NO_CHANGE)}
            scenario={scenario}
          />
        </div>
      </section>

      <section className="bottom-grid">
        <ComparisonTable current={current} scenario={scenario} />
        <div className="info-card">
          <h3>How this works</h3>
          <p>
            Selling more food or drinks raises what you buy: food inventory moves with sales volume,
            not with the prices on your menu.
          </p>
          <p>
            A price change lifts earnings only — and each staff change costs that role&apos;s own pay
            rate, adjusted by the wages slider.
          </p>
          <p>Hidden costs stay put, and nothing on this page is ever written back to your data.</p>
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  today,
  scenario,
  invert = false,
}: {
  label: string;
  today: number;
  scenario: number;
  invert?: boolean;
}) {
  const change = scenario - today;
  const good = invert ? change < 0 : change > 0;

  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{formatMoney(scenario)}</div>
      <div className="stat-delta">
        {change === 0 ? (
          <span className="delta-flat">vs {formatMoney(today)} today</span>
        ) : (
          <>
            <span className={`delta-badge${good ? " is-good" : " is-bad"}`}>
              {change > 0 ? "▲" : "▼"} {formatMoney(Math.abs(change))}
            </span>
            <span className="delta-flat">vs {formatMoney(today)} today</span>
          </>
        )}
      </div>
    </div>
  );
}

function MarginCard({ current, scenario }: { current: Outcome; scenario: Outcome }) {
  const change =
    current.profitMargin === null || scenario.profitMargin === null
      ? 0
      : Math.round((scenario.profitMargin - current.profitMargin) * 10) / 10;

  return (
    <div className="stat-card">
      <div className="stat-label">Profit margin</div>
      <div className="stat-value">{formatPercent(scenario.profitMargin)}</div>
      <div className="stat-delta">
        {change === 0 ? (
          <span className="delta-flat">vs {formatPercent(current.profitMargin)} today</span>
        ) : (
          <>
            <span className={`delta-badge${change > 0 ? " is-good" : " is-bad"}`}>
              {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)} pts
            </span>
            <span className="delta-flat">vs {formatPercent(current.profitMargin)} today</span>
          </>
        )}
      </div>
    </div>
  );
}
