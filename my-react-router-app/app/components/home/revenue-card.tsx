import { formatMoney, monthLabel } from "../../lib/format";
import type { HistoryRow } from "../../lib/types";

export function RevenueCard({ month, history }: { month: string; history: HistoryRow[] }) {
  const index = history.findIndex((row) => row.month === month);
  const current = index === -1 ? null : history[index];
  const previous = index > 0 ? history[index - 1] : null;
  const total = current?.totalRevenue ?? 0;

  const change =
    previous && previous.totalRevenue > 0
      ? ((total - previous.totalRevenue) / previous.totalRevenue) * 100
      : null;

  const sparkline = history.slice(-12).map((row) => row.totalRevenue);
  const peak = Math.max(...sparkline, 1);

  return (
    <section aria-label="Monthly revenue" className="balance-card">
      <div className="balance-topline">
        <div>
          <span className="balance-label">Revenue this month</span>
          <span className="balance-account">{monthLabel(month)} · CAD</span>
        </div>
        <span className="balance-chip"><span /> Monthly total</span>
      </div>
      <p className="balance-amount">{formatMoney(total)}<small>CAD</small></p>
      {change === null ? null : (
        <p className="balance-change">
          <span>{change < 0 ? "↘" : "↗"} {Math.abs(change).toFixed(1)}%</span>{" "}
          <span>vs. {monthLabel(previous!.month)}</span>
        </p>
      )}
      <div className="balance-bottom">
        <div aria-label="Revenue trend over the last 12 months" className="balance-sparkline">
          {sparkline.map((value, barIndex) => (
            <span key={barIndex} style={{ height: `${Math.max((value / peak) * 100, 4)}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
