import { Link } from "react-router";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_COLORS } from "../../lib/categories";
import { formatMoney, formatPercent, monthLabel, shortMonth } from "../../lib/format";
import type { HistoryRow } from "../../lib/types";

export function RevenueExpenseChart({ month, history }: { month: string; history: HistoryRow[] }) {
  const data = history.slice(-12);
  const opacity = (row: HistoryRow) => (row.month === month ? 1 : 0.55);

  return (
    <section className="content-panel chart-panel">
      <div className="panel-heading">
        <div><h2>Revenue vs expenses</h2><p>The last 12 months</p></div>
      </div>

      {data.length === 0 ? (
        <p className="chart-empty">
          No data yet. <Link className="text-link" to="/transactions">Add your first transaction.</Link>
        </p>
      ) : (
        <ResponsiveContainer height={300} width="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              stroke={CHART_COLORS.axis}
              tickFormatter={shortMonth}
              tickLine={false}
              fontSize={11}
            />
            <YAxis
              axisLine={false}
              stroke={CHART_COLORS.axis}
              tickFormatter={(value: number) => formatMoney(value)}
              tickLine={false}
              width={70}
              fontSize={11}
            />
            <YAxis
              axisLine={false}
              orientation="right"
              stroke={CHART_COLORS.axis}
              tickFormatter={(value: number) => `${value}%`}
              tickLine={false}
              width={45}
              yAxisId="right"
              fontSize={11}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #dfe7e2", background: "#fff" }}
              formatter={(value: number, name: string) => [
                name === "Profit margin" ? formatPercent(value) : formatMoney(value),
                name,
              ]}
              labelFormatter={(label: string) => monthLabel(label)}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="totalRevenue" fill={CHART_COLORS.revenue} name="Revenue" radius={[6, 6, 0, 0]}>
              {data.map((row) => <Cell fillOpacity={opacity(row)} key={row.month} />)}
            </Bar>
            <Bar dataKey="totalCosts" fill={CHART_COLORS.costs} name="Expenses" radius={[6, 6, 0, 0]}>
              {data.map((row) => <Cell fillOpacity={opacity(row)} key={row.month} />)}
            </Bar>
            <Line
              dataKey="profitMargin"
              dot={{ r: 3, fill: CHART_COLORS.margin }}
              name="Profit margin"
              stroke={CHART_COLORS.margin}
              strokeWidth={2}
              type="monotone"
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
