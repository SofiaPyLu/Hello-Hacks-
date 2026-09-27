import { COST_META, EARNING_META } from "../../lib/categories";
import { formatMoney, formatPercent } from "../../lib/format";
import type { Outcome } from "../../lib/scenario";
import type { CostCategory, EarningCategory, RatioKey, Status } from "../../lib/types";

const STATUS_COLOR: Record<Exclude<Status, null>, string> = {
  green: "#459b63",
  yellow: "#c9a227",
  red: "#a95f5d",
};

const RATIO_LABELS: Record<RatioKey, string> = {
  foodCostPercent: "Food cost %",
  laborCostPercent: "Labor cost %",
  primeCostPercent: "Prime cost %",
};

const EARNING_ORDER = Object.keys(EARNING_META) as EarningCategory[];
const COST_ORDER = Object.keys(COST_META) as CostCategory[];

function MoneyRow({ label, today, scenario }: { label: string; today: number; scenario: number }) {
  const change = scenario - today;
  return (
    <tr className={change === 0 ? undefined : "is-changed"}>
      <th scope="row">{label}</th>
      <td>{formatMoney(today)}</td>
      <td>{formatMoney(scenario)}</td>
      <td className={change > 0 ? "is-up" : change < 0 ? "is-down" : undefined}>
        {change === 0 ? "—" : `${change > 0 ? "+" : "−"}${formatMoney(Math.abs(change))}`}
      </td>
    </tr>
  );
}

export function ComparisonTable({ current, scenario }: { current: Outcome; scenario: Outcome }) {
  const marginChange =
    current.profitMargin === null || scenario.profitMargin === null
      ? 0
      : Math.round((scenario.profitMargin - current.profitMargin) * 10) / 10;

  return (
    <div className="info-card comparison-card">
      <h3>Line by line</h3>
      <table className="comparison-table">
        <thead>
          <tr>
            <th scope="col">Line</th>
            <th scope="col">Today</th>
            <th scope="col">Scenario</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr className="comparison-section">
            <th colSpan={4} scope="colgroup">
              Earnings
            </th>
          </tr>
          {EARNING_ORDER.map((channel) => (
            <MoneyRow
              key={channel}
              label={EARNING_META[channel].label}
              scenario={scenario.earnings[channel]}
              today={current.earnings[channel]}
            />
          ))}
          <MoneyRow
            label="Total earnings"
            scenario={scenario.totalRevenue}
            today={current.totalRevenue}
          />

          <tr className="comparison-section">
            <th colSpan={4} scope="colgroup">
              Costs
            </th>
          </tr>
          {COST_ORDER.map((category) => (
            <MoneyRow
              key={category}
              label={COST_META[category].label}
              scenario={scenario.costsByCategory[category]}
              today={current.costsByCategory[category]}
            />
          ))}
          <MoneyRow label="Total costs" scenario={scenario.totalCosts} today={current.totalCosts} />

          <tr className="comparison-section">
            <th colSpan={4} scope="colgroup">
              Result
            </th>
          </tr>
          <MoneyRow label="Net profit" scenario={scenario.netProfit} today={current.netProfit} />
          <tr className={marginChange === 0 ? undefined : "is-changed"}>
            <th scope="row">Profit margin</th>
            <td>{formatPercent(current.profitMargin)}</td>
            <td>{formatPercent(scenario.profitMargin)}</td>
            <td className={marginChange > 0 ? "is-up" : marginChange < 0 ? "is-down" : undefined}>
              {marginChange === 0 ? "—" : `${marginChange > 0 ? "+" : "−"}${Math.abs(marginChange).toFixed(1)} pts`}
            </td>
          </tr>

          {(Object.keys(RATIO_LABELS) as RatioKey[]).map((key) => {
            const today = current.ratios[key];
            const next = scenario.ratios[key];
            const changed = today.value !== next.value;
            return (
              <tr className={changed ? "is-changed" : undefined} key={key}>
                <th scope="row">{RATIO_LABELS[key]}</th>
                <td>
                  <StatusValue status={today.status} value={today.value} />
                </td>
                <td>
                  <StatusValue status={next.status} value={next.value} />
                </td>
                <td>{changed ? "recalculated" : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusValue({ value, status }: { value: number | null; status: Status }) {
  return (
    <span className="status-value">
      {status ? <i className="status-dot" style={{ background: STATUS_COLOR[status] }} /> : null}
      {formatPercent(value)}
    </span>
  );
}
