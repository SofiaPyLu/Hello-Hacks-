import { ResponsiveContainer, Area, AreaChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "Jul", value: 32, range: 34, slow: 27 },
  { month: "Aug", value: 35, range: 39, slow: 29 },
  { month: "Sep", value: 39, range: 43, slow: 31 },
  { month: "Oct", value: 42, range: 47, slow: 35 },
  { month: "Nov", value: 46, range: 52, slow: 38 },
  { month: "Dec", value: 50, range: 56, slow: 41 },
];

const statCards = [
  { label: "Q4 revenue", value: "$148,600", delta: "+12.5% vs previous quarter" },
  { label: "Q4 net profit", value: "$32,400", delta: "21% net profit margin" },
  { label: "Cash at Dec 31", value: "$26,800", delta: "After planned cash movements" },
  { label: "Lowest cash balance", value: "$8,200", delta: "Now vs $18,100 below buffer" },
] as const;

const assumptions = [
  { label: "Sales volume", value: "+8% orders" },
  { label: "Average order value", value: "+4.2% value" },
  { label: "Seasonal demand", value: "Holiday lift" },
] as const;

const dueItems = [
  { date: "Oct 15", item: "Team payroll", amount: "-$8,600" },
  { date: "Oct 20", item: "Supplier payment", amount: "-$8,200" },
  { date: "Nov 18", item: "Customer invoices", amount: "+$12,400" },
] as const;

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Forecast() {
  return (
    <div className="forecast-figma-page">
      <div className="forecast-layout">
        <main className="forecast-workspace">
          <div className="forecast-breadcrumbs">
            <span>Forecasting</span>
            <span className="divider">/</span>
            <span>Desktop — 1440</span>
          </div>

          <div className="forecast-window">
            <header className="forecast-topline">
              <div className="forecast-title-wrap">
                <h1>A clearer view of what&apos;s next.</h1>
                <p>Forecast your growth. Understand your cash. Plan your next move.</p>
              </div>
              <div className="topline-actions">
                <button className="topline-select">Oct-Dec 2026 ▾</button>
                <button className="topline-action">+ Create scenario</button>
              </div>
            </header>

            <section className="forecast-banner">
              <div>
                <span className="banner-label">YOUR NEXT 30 DAYS</span>
                <h2>Growth looks good. Keep an eye on November.</h2>
                <p>
                  Revenue is trending up, but supplier payments may bring cash below your $10,000 buffer on Nov 18.
                  Test a change before you commit.
                </p>
              </div>
              <button className="is-gold">Review cash buffer →</button>
            </section>

            <section className="stats-row">
              {statCards.map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-delta">{card.delta}</div>
                </div>
              ))}
            </section>

            <section className="forecast-main-grid">
              <div className="chart-card">
                <div className="chart-header-row">
                  <div className="tabs">
                    <button className="tab is-active">Revenue</button>
                    <button className="tab">Profit</button>
                    <button className="tab">Cash balance</button>
                  </div>
                  <button className="filter-pill">Monthly ▾</button>
                </div>

                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#207f66" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#207f66" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#dfe9e5" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7a8885", fontSize: 11 }} />
                      <YAxis
                        domain={[20, 60]}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}k`}
                        tick={{ fill: "#7a8885", fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [fmtCurrency(value * 1000), "Forecast"]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{ borderRadius: 12, border: "1px solid #dfe7e2", background: "#fff" }}
                      />
                      <ReferenceLine y={40} stroke="#dfe9e5" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="range" stroke="#2c7d67" strokeWidth={2} fillOpacity={1} fill="url(#fillRevenue)" />
                      <Area type="monotone" dataKey="slow" stroke="#d4e985" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="value" stroke="#145b49" strokeWidth={2.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-legend">
                  <span><i className="swatch expected" />Expected</span>
                  <span><i className="swatch stronger" />Stronger sales</span>
                  <span><i className="swatch slower" />Slower sales</span>
                </div>

                <button className="assumption-link">View forecast assumptions →</button>
              </div>

              <div className="right-panel">
                <div className="mini-card soft-green">
                  <div className="mini-card-header">YOUR NEXT MOVE</div>
                  <h3>Can I afford this?</h3>
                  <p>Try a decision before making it.</p>

                  <div className="mini-form-row">
                    <label>
                      <span>Monthly cost</span>
                      <input value="$3,200" readOnly />
                    </label>
                    <label>
                      <span>Start date</span>
                      <input value="Nov 1, 2026" readOnly />
                    </label>
                  </div>

                  <div className="mini-figure">Lowest cash after this hire</div>
                  <div className="mini-value">$5,000</div>
                  <p className="mini-note">$3,000 less than your base forecast. A December cash buffer would be safer.</p>
                </div>

                <button className="compare-button">Compare start dates →</button>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="info-card">
                <h3>What&apos;s shaping your forecast?</h3>
                <ul className="assumption-list">
                  {assumptions.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
                <button className="subtle-button">Edit assumptions →</button>
              </div>

              <div className="info-card">
                <h3>Know what&apos;s coming due</h3>
                <ul className="due-list">
                  {dueItems.map((item) => (
                    <li key={item.date}>
                      <span>{item.date}</span>
                      <span>{item.item}</span>
                      <strong>{item.amount}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
