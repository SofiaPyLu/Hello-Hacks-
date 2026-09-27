import { useEffect, useState, type FocusEvent, type KeyboardEvent } from "react";
import { useFetcher } from "react-router";

import { formatMoney } from "../../lib/format";
import type { Cell, CostCategory } from "../../lib/types";

type CostCellProps = {
  month: string;
  category: CostCategory;
  subcategory: string;
  cell: Cell;
  newest: boolean;
  onError: (message: string | null) => void;
};

export function CostCell({ month, category, subcategory, cell, newest, onError }: CostCellProps) {
  const fetcher = useFetcher<{ error?: string }>();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("");
  const [count, setCount] = useState("");
  const [pay, setPay] = useState("");

  const isSalary = category === "salaries";
  const saving = fetcher.state !== "idle";

  // The save failed: drop out of edit mode so the cell falls back to the stored value.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.error) {
      onError(fetcher.data.error);
      setEditing(false);
    }
  }, [fetcher.state, fetcher.data, onError]);

  const startEditing = () => {
    setAmount(cell.amount ? String(cell.amount) : "");
    setCount(cell.count ? String(cell.count) : "");
    setPay(cell.payPerPerson ? String(cell.payPerPerson) : "");
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    onError(null);
    const value: Record<string, string> = isSalary
      ? { count, payPerPerson: pay }
      : { amount };
    fetcher.submit(
      { intent: "set-cell", month, category, subcategory, ...value },
      { method: "post" },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
    if (event.key === "Escape") setEditing(false);
  };

  // Moving between the two salary inputs must not count as leaving the cell.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    save();
  };

  const className = [
    "ledger-cell",
    newest ? "is-newest" : "",
    saving ? "is-saving" : "",
    editing ? "is-editing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (editing) {
    return (
      <td className={className}>
        <div className="cell-editor" onBlur={handleBlur} onKeyDown={handleKeyDown}>
          {isSalary ? (
            <>
              <label className="cell-field">
                <span>Staff</span>
                <input
                  autoFocus
                  min="0"
                  onChange={(event) => setCount(event.target.value)}
                  step="1"
                  type="number"
                  value={count}
                />
              </label>
              <label className="cell-field">
                <span>Pay / person</span>
                <input
                  min="0"
                  onChange={(event) => setPay(event.target.value)}
                  step="any"
                  type="number"
                  value={pay}
                />
              </label>
              <span className="cell-preview">
                = {formatMoney((Number(count) || 0) * (Number(pay) || 0))}
              </span>
            </>
          ) : (
            <input
              autoFocus
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              step="any"
              type="number"
              value={amount}
            />
          )}
        </div>
      </td>
    );
  }

  return (
    <td className={className}>
      <button className="cell-button" onClick={startEditing} type="button">
        {isSalary && cell.count ? (
          <span className="cell-detail">
            {cell.count} × {formatMoney(cell.payPerPerson ?? 0)}
          </span>
        ) : null}
        <span className={cell.amount === 0 ? "cell-value is-zero" : "cell-value"}>
          {cell.amount === 0 ? "—" : formatMoney(cell.amount)}
        </span>
      </button>
      {cell.entries > 1 ? (
        <span
          className="cell-dot"
          title={`Combines ${cell.entries} entries — saving merges them into one`}
        />
      ) : null}
    </td>
  );
}
