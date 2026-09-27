import { useState } from "react";
import { useRouteError } from "react-router";
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Route } from "./+types/forecast";
import { BackendError } from "../components/backend-error";
import { getHistory } from "../lib/api";
import { formatMoney, monthLabel, shortMonth } from "../lib/format";
import type { HistoryRow } from "../lib/types";

export async function clientLoader() {
  return { history: await getHistory() };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <section className="content-panel empty-state-panel"><h3>Loading your forecast…</h3><p>Using your recorded earnings and costs.</p></section>;
}

export function ErrorBoundary() {
  return <BackendError error={useRouteError()} />;
}

function addMonths(month: string, count: number) {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(year, number - 1 + count, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function averageChange(rows: HistoryRow[], key: "totalRevenue" | "totalCosts" | "netProfit") {
  const recent = rows.slice(-4);
  if (recent.length < 2) return 0;
  const changes = recent.slice(1).map((row, index) => row[key] - recent[index][key]);
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
}

function sumNextThreeMonths(latest: number, monthlyChange: number, floorAtZero = false) {
  return [1, 2, 3].reduce((sum, offset) => {
    const projected = latest + monthlyChange * offset;
    return sum + (floorAtZero ? Math.max(0, projected) : projected);
  }, 0);
}

type ForecastRow = { month: string; revenue: number; profit: number; projected?: boolean };

function makeForecast(history: HistoryRow[]): ForecastRow[] {
  const actuals: ForecastRow[] = history.slice(-6).map((row) => ({
    month: row.month,
    revenue: row.totalRevenue,
    profit: row.netProfit,
  }));
  if (history.length === 0) return [];
  const last = history[history.length - 1];
  const revenueChange = averageChange(history, "totalRevenue");
  const profitChange = averageChange(history, "netProfit");
  for (let offset = 1; offset <= 3; offset += 1) {
    const revenue = Math.max(0, last.totalRevenue + revenueChange * offset);
    const profit = last.netProfit + profitChange * offset;
    actuals.push({
      month: addMonths(last.month, offset),
      revenue,
      profit,
      projected: true,
    });
  }
  return actuals;
}

export default function Forecast({ loaderData }: Route.ComponentProps) {
  const { history } = loaderData;
  const [monthlyCost, setMonthlyCost] = useState(3200);
  const [startMonth, setStartMonth] = useState(() => history.length ? addMonths(history[history.length - 1].month, 1) : "");
  const [metric, setMetric] = useState<"revenue" | "profit">("revenue");
  const chartData = makeForecast(history);
  const latest = history[history.length - 1];
  const revenueTrend = averageChange(history, "totalRevenue");
  const profitTrend = averageChange(history, "netProfit");
  const projectedRevenue = latest ? sumNextThreeMonths(latest.totalRevenue, revenueTrend, true) : 0;
  const projectedProfit = latest ? sumNextThreeMonths(latest.netProfit, profitTrend) : 0;
  const addedCostMonths = latest && startMonth ? Math.max(0,
    (Number(latest.month.slice(0, 4)) - Number(startMonth.slice(0, 4))) * 12 + Number(latest.month.slice(5)) - Number(startMonth.slice(5)) + 4,
  ) : 0;
  const scenarioProfit = projectedProfit - monthlyCost * addedCostMonths;
  const nextMonth = latest ? addMonths(latest.month, 1) : "";

  return (
    <div className="forecast-figma-page">
      <div className="forecast-layout">
        <main className="forecast-workspace">
          <div className="forecast-breadcrumbs"><span>Forecasting</span><span className="divider">/</span><span>Based on your data</span></div>
          <div className="forecast-window">
            <header className="forecast-topline">
              <div className="forecast-title-wrap"><h1>A clearer view of what&apos;s next.</h1><p>Projections use your recent monthly earnings and costs.</p></div>
              <div className="topline-actions"><span className="topline-select">{history.length ? `Through ${monthLabel(latest.month)}` : "No recorded data"}</span></div>
            </header>

            {history.length === 0 ? (
              <section className="forecast-banner"><div><span className="banner-label">YOUR FORECAST</span><h2>Add a transaction to get started.</h2><p>Once you record earnings or costs, this page will project the next three months from your data.</p></div><a className="is-gold" href="/transactions">Add transaction →</a></section>
            ) : <>
              <section className="forecast-banner">
                <div><span className="banner-label">NEXT 3 MONTHS · ESTIMATE</span><h2>{profitTrend >= 0 ? "Your recent trend points to positive movement." : "Your recent trend points to tighter margins."}</h2><p>Based on the average month-to-month change in your last four recorded months. This is a simple estimate, not a cash-flow statement.</p></div>
              </section>

              <section className="stats-row">
                <div className="stat-card"><div className="stat-label">Projected revenue · next 3 months</div><div className="stat-value">{formatMoney(projectedRevenue)}</div><div className="stat-delta">Estimated from recent revenue trend</div></div>
                <div className="stat-card"><div className="stat-label">Projected net profit · next 3 months</div><div className="stat-value">{formatMoney(projectedProfit)}</div><div className="stat-delta">Before any new scenario costs</div></div>
                <div className="stat-card"><div className="stat-label">Latest month revenue</div><div className="stat-value">{formatMoney(latest.totalRevenue)}</div><div className="stat-delta">{monthLabel(latest.month)}</div></div>
                <div className="stat-card"><div className="stat-label">Latest month net profit</div><div className="stat-value">{formatMoney(latest.netProfit)}</div><div className="stat-delta">{monthLabel(latest.month)}</div></div>
              </section>

              <section className="forecast-main-grid">
                <div className="chart-card">
                  <div className="chart-header-row"><div className="tabs">
                    <button aria-pressed={metric === "revenue"} className={`tab${metric === "revenue" ? " is-active" : ""}`} onClick={() => setMetric("revenue")} type="button">Revenue</button>
                    <button aria-pressed={metric === "profit"} className={`tab${metric === "profit" ? " is-active" : ""}`} onClick={() => setMetric("profit")} type="button">Net profit</button>
                  </div><span className="filter-pill">Monthly · 3 month estimate</span></div>
                  <div className="chart-wrap"><ResponsiveContainer height={300} width="100%">
                    <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid stroke="#dfe9e5" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tickFormatter={shortMonth} tick={{ fill: "#7a8885", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} tick={{ fill: "#7a8885", fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [formatMoney(value), ""]} labelFormatter={(label: string) => `${monthLabel(label)}${chartData.find((row) => row.month === label)?.projected ? " · estimate" : " · actual"}`} contentStyle={{ borderRadius: 12, border: "1px solid #dfe7e2", background: "#fff" }} />
                      {metric === "revenue" ? <Line dataKey="revenue" name="Revenue" stroke="#145b49" strokeWidth={2.5} dot={(props: { cx?: number; cy?: number; payload?: ForecastRow }) => <circle cx={props.cx} cy={props.cy} r={4} fill={props.payload?.projected ? "#d4e985" : "#145b49"} stroke="#145b49" />} connectNulls /> : <Line dataKey="profit" name="Net profit" stroke="#145b49" strokeWidth={2.5} dot={(props: { cx?: number; cy?: number; payload?: ForecastRow }) => <circle cx={props.cx} cy={props.cy} r={4} fill={props.payload?.projected ? "#d4e985" : "#145b49"} stroke="#145b49" />} connectNulls />}
                    </ComposedChart>
                  </ResponsiveContainer></div>
                  <div className="chart-legend"><span><i className="swatch expected" />Recorded</span><span><i className="swatch stronger" />Estimate</span></div>
                  <p className="stat-delta">Estimates extend the average monthly change from up to four recorded months.</p>
                </div>

                <div className="right-panel"><div className="mini-card soft-green">
                  <div className="mini-card-header">TRY A DECISION</div><h3>Can I afford this monthly cost?</h3><p>Estimate the effect on projected net profit over the next three months.</p>
                  <div className="mini-form-row"><label><span>Monthly cost (CAD)</span><input min="0" onChange={(event) => setMonthlyCost(Number(event.target.value) || 0)} type="number" value={monthlyCost} /></label><label><span>Starts in</span><input min={nextMonth} onChange={(event) => setStartMonth(event.target.value)} type="month" value={startMonth} /></label></div>
                  <div className="mini-figure">Projected net profit after this cost</div><div className="mini-value">{formatMoney(scenarioProfit)}</div><p className="mini-note">Estimate includes {addedCostMonths} months of this cost and assumes your recent trend continues.</p>
                </div></div>
              </section>
              <section className="bottom-grid"><div className="info-card"><h3>How this estimate is calculated</h3><p>Revenue and net profit are projected from the average month-to-month change across up to the last four recorded months.</p><p>Only months with entries are available. Add more monthly transactions for a steadier estimate.</p></div><div className="info-card"><h3>Latest recorded month</h3><ul className="assumption-list"><li><span>Revenue</span><strong>{formatMoney(latest.totalRevenue)}</strong></li><li><span>Costs</span><strong>{formatMoney(latest.totalCosts)}</strong></li><li><span>Net profit</span><strong>{formatMoney(latest.netProfit)}</strong></li></ul></div></section>
            </>}
          </div>
        </main>
      </div>
    </div>
  );
}
