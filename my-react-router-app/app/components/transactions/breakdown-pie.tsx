import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatMoney } from "../../lib/format";

export type Slice = { key: string; label: string; value: number; color: string };

const percent = (value: number, total: number) =>
  total === 0 ? "0.0%" : `${((value / total) * 100).toFixed(1)}%`;

export function BreakdownPie({
  title,
  subtitle,
  total,
  slices,
}: {
  title: string;
  subtitle: string;
  total: number;
  slices: Slice[];
}) {
  const drawn = slices.filter((slice) => slice.value > 0);
  // ponytail: recharts 2.x only finds chart children that are DIRECT children of the chart —
  // wrapping <Pie>/<Tooltip> in a fragment makes them silently disappear.
  const isEmpty = drawn.length === 0;
  const data = isEmpty ? [{ key: "empty", label: "Nothing yet", value: 1, color: "#eef2ef" }] : drawn;

  return (
    <section className="content-panel pie-panel">
      <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>

      <div className="pie-chart">
        <ResponsiveContainer height={220} width="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="62%"
              isAnimationActive={false}
              nameKey="label"
              outerRadius="90%"
              paddingAngle={isEmpty ? 0 : 2}
              stroke="none"
            >
              {data.map((slice) => <Cell fill={slice.color} key={slice.key} />)}
            </Pie>
            {isEmpty ? null : (
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #dfe7e2", background: "#fff" }}
                formatter={(value: number, name: string) => [
                  `${formatMoney(value, 2)} · ${percent(value, total)}`,
                  name,
                ]}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center">
          <strong>{formatMoney(total)}</strong>
          <span>Total</span>
        </div>
      </div>

      {total === 0 ? <p className="pie-empty">Nothing recorded for this month yet.</p> : null}

      <ul className="pie-legend">
        {slices.map((slice) => (
          <li key={slice.key}>
            <i style={{ background: slice.color }} />
            <span>{slice.label}</span>
            <strong>{formatMoney(slice.value, 2)}</strong>
            <em>{percent(slice.value, total)}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
