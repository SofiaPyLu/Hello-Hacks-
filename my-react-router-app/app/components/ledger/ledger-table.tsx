import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { COST_META, EARNING_META, SUBCATEGORY_LABELS } from "../../lib/categories";
import { formatMoney, formatPercent, shortMonth } from "../../lib/format";
import type { CostCategory, EarningCategory, Sheet } from "../../lib/types";
import { CostCell } from "./cost-cell";

const COST_ORDER = Object.keys(COST_META) as CostCategory[];
const EARNING_ORDER = Object.keys(EARNING_META) as EarningCategory[];

const money = (value: number) => (value === 0 ? "—" : formatMoney(value));

export function LedgerTable({ sheet }: { sheet: Sheet }) {
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { months, totals } = sheet;
  const newest = months[months.length - 1];

  // ponytail: the newest month is the one people come here for, so start scrolled to it.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollLeft = node.scrollWidth;
  }, [months.length]);

  const columnClass = (month: string) =>
    month === newest ? "ledger-cell is-newest" : "ledger-cell";

  const groupTotal = (category: CostCategory, month: string) =>
    sheet.costs
      .filter((row) => row.category === category)
      .reduce((sum, row) => sum + (row.cells[month]?.amount ?? 0), 0);

  return (
    <section className="content-panel ledger-panel">
      <div className="panel-heading">
        <div>
          <h2>Monthly ledger</h2>
          <p>Costs are editable — earnings come from your transactions.</p>
        </div>
      </div>

      <div className="ledger-scroll" ref={scroller}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th className="row-label" scope="col">
                Category
              </th>
              {months.map((month) => (
                <th className={columnClass(month)} key={month} scope="col">
                  <Link className="month-link" to={`/transactions?month=${month}`}>
                    {shortMonth(month)} {month.slice(0, 4)}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="ledger-section">
              <th className="row-label" colSpan={months.length + 1} scope="colgroup">
                Costs
              </th>
            </tr>

            {COST_ORDER.map((category) => (
              <Fragment key={category}>
                <tr className="ledger-group">
                  <th
                    className="row-label"
                    scope="row"
                    style={{ borderLeftColor: COST_META[category].color }}
                  >
                    {COST_META[category].label}
                  </th>
                  {months.map((month) => (
                    <td className={columnClass(month)} key={month}>
                      {money(groupTotal(category, month))}
                    </td>
                  ))}
                </tr>

                {sheet.costs
                  .filter((row) => row.category === category)
                  .map((row) => (
                    <tr key={row.subcategory}>
                      <th className="row-label is-sub" scope="row">
                        {SUBCATEGORY_LABELS[row.subcategory] ?? row.subcategory}
                      </th>
                      {months.map((month) => (
                        <CostCell
                          category={category}
                          cell={row.cells[month] ?? { amount: 0, entries: 0 }}
                          key={month}
                          month={month}
                          newest={month === newest}
                          onError={setError}
                          subcategory={row.subcategory}
                        />
                      ))}
                    </tr>
                  ))}
              </Fragment>
            ))}

            <tr className="ledger-total">
              <th className="row-label" scope="row">
                Total costs
              </th>
              {months.map((month) => (
                <td className={columnClass(month)} key={month}>
                  {money(totals[month]?.totalCosts ?? 0)}
                </td>
              ))}
            </tr>

            <tr className="ledger-section">
              <th className="row-label" colSpan={months.length + 1} scope="colgroup">
                Earnings
                <Link className="section-note" to="/transactions">
                  View-only · recorded in Transactions
                </Link>
              </th>
            </tr>

            {EARNING_ORDER.map((subcategory) => {
              const row = sheet.earnings.find((item) => item.subcategory === subcategory);
              return (
                <tr key={subcategory}>
                  <th className="row-label is-sub" scope="row">
                    {EARNING_META[subcategory].label}
                  </th>
                  {months.map((month) => (
                    <td className={`${columnClass(month)} is-readonly`} key={month}>
                      {money(row?.cells[month]?.amount ?? 0)}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr>
              <th className="row-label is-sub" scope="row">
                Customers served
              </th>
              {months.map((month) => (
                <td className={`${columnClass(month)} is-readonly`} key={month}>
                  {totals[month]?.customers || "—"}
                </td>
              ))}
            </tr>

            <tr className="ledger-total">
              <th className="row-label" scope="row">
                Total earnings
              </th>
              {months.map((month) => (
                <td className={columnClass(month)} key={month}>
                  {money(totals[month]?.totalRevenue ?? 0)}
                </td>
              ))}
            </tr>

            <tr className="ledger-total is-net">
              <th className="row-label" scope="row">
                Net profit
              </th>
              {months.map((month) => {
                const net = totals[month]?.netProfit ?? 0;
                return (
                  <td
                    className={`${columnClass(month)}${net < 0 ? " is-negative" : ""}`}
                    key={month}
                  >
                    {formatMoney(net)}
                  </td>
                );
              })}
            </tr>

            <tr className="ledger-total">
              <th className="row-label" scope="row">
                Profit margin
              </th>
              {months.map((month) => (
                <td className={columnClass(month)} key={month}>
                  {formatPercent(totals[month]?.profitMargin ?? null)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {error ? <p className="ledger-error">{error}</p> : null}
    </section>
  );
}
