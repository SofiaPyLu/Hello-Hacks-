import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import { COST_CATEGORIES, COST_META, EARNING_META, SUBCATEGORY_LABELS } from "../../lib/categories";
import { formatMoney } from "../../lib/format";
import type { CostCategory, EarningCategory } from "../../lib/types";

const COST_KEYS = Object.keys(COST_META) as CostCategory[];
const EARNING_KEYS = Object.keys(EARNING_META) as EarningCategory[];

export function TransactionForm({ month }: { month: string }) {
  const actionData = useActionData() as { ok?: boolean; intent?: string; error?: string } | undefined;
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const [type, setType] = useState<"cost" | "revenue">("cost");
  const [category, setCategory] = useState<CostCategory>("utilities");
  const [earning, setEarning] = useState<EarningCategory>("food");
  const [count, setCount] = useState("");
  const [payPerPerson, setPayPerPerson] = useState("");

  const isSalaries = type === "cost" && category === "salaries";
  const busy = navigation.state !== "idle";
  const preview = Number(count) * Number(payPerPerson);

  useEffect(() => {
    if (!actionData?.ok || actionData.intent !== "create") return;
    formRef.current?.reset();
    setCount("");
    setPayPerPerson("");
  }, [actionData]);

  return (
    <section className="content-panel form-panel">
      <div className="panel-heading">
        <div><h2>Add a transaction</h2><p>Record a cost or an earning for this month</p></div>
      </div>

      <Form className="entry-form" method="post" ref={formRef}>
        <input name="intent" type="hidden" value="create" />

        <div className="form-row type-toggle">
          {(["cost", "revenue"] as const).map((option) => (
            <button
              className={`type-button${type === option ? " is-active" : ""}`}
              key={option}
              onClick={() => setType(option)}
              type="button"
            >
              {option === "cost" ? "Cost" : "Earning"}
            </button>
          ))}
          <input name="type" type="hidden" value={type} />
        </div>

        <label className="form-field">
          Month
          <input defaultValue={month} name="month" required type="month" />
        </label>

        {type === "cost" ? (
          <>
            <label className="form-field">
              Category
              <select
                name="category"
                onChange={(event) => setCategory(event.target.value as CostCategory)}
                value={category}
              >
                {COST_KEYS.map((key) => (
                  <option key={key} value={key}>{COST_META[key].label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Subcategory
              <select key={category} name="subcategory">
                {COST_CATEGORIES[category].map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {SUBCATEGORY_LABELS[subcategory] ?? subcategory}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label className="form-field">
            Category
            <select
              name="subcategory"
              onChange={(event) => setEarning(event.target.value as EarningCategory)}
              value={earning}
            >
              {EARNING_KEYS.map((key) => (
                <option key={key} value={key}>{EARNING_META[key].label}</option>
              ))}
            </select>
          </label>
        )}

        {isSalaries ? (
          <>
            <label className="form-field">
              Number of staff
              <input
                min={1}
                name="count"
                onChange={(event) => setCount(event.target.value)}
                step={1}
                type="number"
                value={count}
              />
            </label>
            <label className="form-field">
              Monthly pay per person
              <input
                min={0}
                name="payPerPerson"
                onChange={(event) => setPayPerPerson(event.target.value)}
                step="0.01"
                type="number"
                value={payPerPerson}
              />
            </label>
            {preview > 0 ? <p className="form-preview">= {formatMoney(preview, 2)} / month</p> : null}
          </>
        ) : (
          <label className="form-field">
            Amount
            <input min={0} name="amount" step="0.01" type="number" />
          </label>
        )}

        {type === "revenue" ? (
          <label className="form-field">
            Customers served <small>(optional)</small>
            <input min={0} name="customers" step={1} type="number" />
          </label>
        ) : null}

        <label className="form-field form-field-wide">
          Note <small>(optional)</small>
          <input maxLength={200} name="note" type="text" />
        </label>

        {actionData?.error ? <p className="form-error">{actionData.error}</p> : null}

        <button className="section-action" disabled={busy} type="submit">
          {busy ? "Saving…" : "Save transaction"}
        </button>
      </Form>
    </section>
  );
}
