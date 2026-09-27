import { formatMoney } from "../../lib/format";
import {
  ROLES,
  hasChanges,
  type Baseline,
  type Levers,
  type Outcome,
  type Role,
} from "../../lib/scenario";
import { SUBCATEGORY_LABELS } from "../../lib/categories";

type NumericLever = Exclude<keyof Levers, "staff">;
type Patch = Partial<Record<NumericLever, number>> & { staff?: Partial<Record<Role, number>> };

const QUICK_SCENARIOS: { label: string; patch: Patch }[] = [
  { label: "Hire a waiter", patch: { staff: { waiter: 1 } } },
  { label: "Raise prices 5%", patch: { pricesPct: 5 } },
  { label: "Busy season", patch: { dineInVolumePct: 15, ordersVolumePct: 15 } },
  { label: "Supplier price hike", patch: { ingredientsPct: 10 } },
];

const SLIDERS: { key: NumericLever; label: string; min: number; max: number; hint?: string }[] = [
  {
    key: "pricesPct",
    label: "Menu prices",
    min: -20,
    max: 30,
    hint: "Higher prices can cost customers — try pairing this with lower sales.",
  },
  { key: "dineInVolumePct", label: "In-restaurant sales", min: -50, max: 50 },
  { key: "ordersVolumePct", label: "Delivery & takeout", min: -50, max: 50 },
  { key: "ingredientsPct", label: "Ingredient prices", min: -30, max: 30 },
  { key: "wagesPct", label: "Wages", min: -20, max: 30 },
  { key: "utilitiesPct", label: "Rent & utilities", min: -30, max: 50 },
];

const signedPercent = (value: number) => `${value > 0 ? "+" : ""}${value}%`;
const signedMoney = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatMoney(Math.abs(value))}`;

function isApplied(levers: Levers, patch: Patch) {
  const staffMatches = Object.entries(patch.staff ?? {}).every(
    ([role, delta]) => levers.staff[role as Role] === delta,
  );
  const numbersMatch = (Object.keys(patch) as (keyof Patch)[])
    .filter((key) => key !== "staff")
    .every((key) => levers[key as NumericLever] === patch[key as NumericLever]);
  return staffMatches && numbersMatch;
}

function withPatch(levers: Levers, patch: Patch, on: boolean): Levers {
  const next: Levers = { ...levers, staff: { ...levers.staff } };
  for (const [role, delta] of Object.entries(patch.staff ?? {})) {
    next.staff[role as Role] = on ? (delta as number) : 0;
  }
  for (const key of Object.keys(patch) as (keyof Patch)[]) {
    if (key === "staff") continue;
    next[key as NumericLever] = on ? (patch[key as NumericLever] as number) : 0;
  }
  return next;
}

type LeverPanelProps = {
  levers: Levers;
  base: Baseline;
  current: Outcome;
  scenario: Outcome;
  onChange: (levers: Levers) => void;
  onReset: () => void;
};

export function LeverPanel({ levers, base, current, scenario, onChange, onReset }: LeverPanelProps) {
  const setStaff = (role: Role, delta: number) =>
    onChange({ ...levers, staff: { ...levers.staff, [role]: levers.staff[role] + delta } });

  return (
    <div className="mini-card lever-panel">
      <div className="mini-card-header">WHAT IF…</div>

      <div className="lever-group">
        <div className="lever-group-head">
          <h3>Quick scenarios</h3>
          {hasChanges(levers) ? (
            <button className="lever-reset" onClick={onReset} type="button">
              Reset all
            </button>
          ) : null}
        </div>
        <div className="chip-row">
          {QUICK_SCENARIOS.map(({ label, patch }) => {
            const active = isApplied(levers, patch);
            return (
              <button
                aria-pressed={active}
                className={`scenario-chip${active ? " is-active" : ""}`}
                key={label}
                onClick={() => onChange(withPatch(levers, patch, !active))}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lever-group">
        <h3>Team</h3>
        {ROLES.map((role) => {
          const from = base.staff[role].count;
          const to = scenario.staff[role].count;
          const cost = scenario.staff[role].amount - current.staff[role].amount;
          const cannotHire = base.staff[role].payPerPerson === 0;

          return (
            <div className={`staff-row${levers.staff[role] !== 0 ? " is-changed" : ""}`} key={role}>
              <span className="staff-name">
                {SUBCATEGORY_LABELS[role]} <strong>{from} → {to}</strong>
              </span>
              <span className="staff-cost">{cost === 0 ? "no change" : signedMoney(cost)}</span>
              <span className="stepper">
                <button
                  aria-label={`One fewer ${SUBCATEGORY_LABELS[role].toLowerCase()}`}
                  disabled={to === 0}
                  onClick={() => setStaff(role, -1)}
                  type="button"
                >
                  −
                </button>
                <button
                  aria-label={`One more ${SUBCATEGORY_LABELS[role].toLowerCase()}`}
                  disabled={cannotHire}
                  onClick={() => setStaff(role, 1)}
                  title={cannotHire ? "Record a pay rate for this role first" : undefined}
                  type="button"
                >
                  +
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <div className="lever-group">
        <h3>Prices &amp; volume</h3>
        {SLIDERS.map(({ key, label, min, max, hint }) => (
          <div className={`slider-row${levers[key] !== 0 ? " is-changed" : ""}`} key={key}>
            <label>
              <span className="slider-label">
                {label}
                <strong>{signedPercent(levers[key])}</strong>
              </span>
              <input
                max={max}
                min={min}
                onChange={(event) => onChange({ ...levers, [key]: Number(event.target.value) })}
                step={1}
                type="range"
                value={levers[key]}
              />
            </label>
            {hint ? <p className="slider-hint">{hint}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
