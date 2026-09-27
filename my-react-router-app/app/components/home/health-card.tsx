import { CHART_COLORS } from "../../lib/categories";
import { formatMoney, formatPercent } from "../../lib/format";
import type { RatioKey, Status, Summary } from "../../lib/types";

const STATUS_COLORS: Record<Exclude<Status, null>, string> = {
  green: "#459b63",
  yellow: "#c9a227",
  red: "#a95f5d",
};

const RATIOS: { key: RatioKey; label: string; target: number; goesTo: string }[] = [
  { key: "foodCostPercent", label: "Food cost", target: 35, goesTo: "ingredients" },
  { key: "laborCostPercent", label: "Labor cost", target: 35, goesTo: "wages" },
  { key: "primeCostPercent", label: "Prime cost", target: 65, goesTo: "food and labor" },
];

function marginLabel(margin: number) {
  if (margin < 0) return "Losing money";
  if (margin < 10) return "Dangerously thin";
  if (margin < 15) return "Tight";
  if (margin <= 20) return "Healthy";
  return "Strong";
}

export function HealthCard({ summary }: { summary: Summary }) {
  const margin = summary.profitMargin;

  return (
    <section className="content-panel health-panel">
      <div className="panel-heading"><div><h2>Business health</h2></div></div>

      <p className="health-margin" style={{ color: CHART_COLORS.margin }}>{formatPercent(margin)}</p>
      <p className="health-margin-label">{margin === null ? "No revenue yet" : marginLabel(margin)}</p>
      <p className={`health-net${summary.netProfit < 0 ? " is-negative" : ""}`}>
        {formatMoney(summary.netProfit)} net profit
      </p>

      <ul className="health-ratios">
        {RATIOS.map(({ key, label, target, goesTo }) => {
          const { value, status } = summary.ratios[key];
          return (
            <li className="health-ratio" key={key}>
              <div className="health-ratio-head">
                <span>
                  {status === null ? null : (
                    <i className="health-dot" style={{ background: STATUS_COLORS[status] }} />
                  )}
                  {label}
                </span>
                <strong>{formatPercent(value)}</strong>
              </div>
              <p>
                {value === null
                  ? `Target ${target}%`
                  : `${formatMoney(value / 100, 2)} of every $1 goes to ${goesTo} · target ${target}%`}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
