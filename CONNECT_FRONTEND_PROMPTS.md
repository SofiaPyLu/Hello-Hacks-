# EZ Money: Connect Frontend ↔ Backend

Five steps. Step 0 is manual git work. Steps 1–5 are prompts to paste into your coding agent, one at a time, in order. Each step ends with checks that must pass before committing.

**Parallel work:** after Step 0, Step 1 (backend only) and Step 2 (frontend `app/lib/` only) touch different files and can run at the same time. After Step 2 is pushed, Step 3 (Home) and Step 4 (Transactions) can also run in parallel, because each owns its own route, component folder and CSS file.

**PowerShell note:** use `curl.exe`, not `curl`. In Windows PowerShell, `curl` is a different command.

---

## Step 0: Git setup (manual, do once)

The finished backend (68 passing tests) lives on the `Backend` branch, not on `main` or `front-end`. It merges into `front-end` with no conflicts.

```powershell
git fetch origin
git checkout front-end
git pull origin front-end
git merge origin/Backend
cd Backend; npm install; npm run seed; npm test; cd ..
git push origin front-end
```

`npm test` must show `# fail 0`.

**Do NOT merge `phase4-entry-and-ai-summary`.** It is a second, different implementation of the entries and AI-summary routes, and it conflicts with `Backend`. The `frontend` branch (without the hyphen) is an older copy of `front-end`. After checking with whoever made them, delete both:

```powershell
git push origin --delete phase4-entry-and-ai-summary
git push origin --delete frontend
```

---

## Step 1: Backend, match the Earnings categories and allow a fresh start

```text
Work only in Backend/. CommonJS, no new dependencies.

Goal: Earnings categories must be food / beverages / orders (the UI's categories), 
customers must be optional, and users must be able to reset the data to empty or demo.

1. Backend/src/constants.js: change CATEGORIES.revenue.sales to ["food", "beverages", "orders"].

2. Backend/src/validation/validateEntry.js: for revenue entries, customers is now OPTIONAL.
   If omitted, store customers: 0. If present, it must be an integer >= 0
   (keep the existing error message).

3. Backend/scripts/generateSeed.js and Backend/tests/fixtures/september.json: replace the three 
   September revenue rows (keep ids 14–16 in the fixture) with:
     food      amount 26000  customers 1100
     beverages amount 9000   customers 0
     orders    amount 7000   customers 300
   Totals stay 42000 revenue / 1400 customers, so every summary number is unchanged.

4. Update every test that references dine-in / takeout / delivery:
   Backend/tests/revenueProcessor.test.js, Backend/tests/validateEntry.test.js,
   Backend/tests/entries.route.test.js. Replace "missing customers → 400" tests with
   "missing customers → saved with customers 0". Add a test that customers: -1 → 400.
   Run: grep -rn "dine-in\|takeout\|delivery" Backend/src Backend/scripts Backend/tests
   It must return nothing.

5. New file Backend/src/reset.js: export resetData(mode).
   mode "empty" → writeEntries([]) from src/store.js
   mode "demo"  → call the exported generateSeed() from scripts/generateSeed.js
   Anything else → throw an Error. Return { mode, entries: <count> }.

6. New file Backend/src/routes/data.js: POST /reset with body { mode }. 
   Invalid mode → 400 { error: "mode must be 'empty' or 'demo'" }. Otherwise 200 with resetData's result.
   Mount it in Backend/server.js: app.use("/api/data", require("./src/routes/data")).

7. New file Backend/tests/reset.test.js: use a temp DATA_FILE. "empty" leaves 0 entries,
   "demo" leaves 192 entries, and "bogus" throws.

Checks, all must pass before committing:
  cd Backend; npm run seed; npm test   → fail 0
  npm start, then in a second terminal:
  curl.exe -s "localhost:3001/api/revenue?month=2026-09"
    → bySubcategory { food: 26000, beverages: 9000, orders: 7000 }, customers 1400
  curl.exe -s -X POST localhost:3001/api/entries -H "Content-Type: application/json" -d "{\"month\":\"2026-09\",\"type\":\"revenue\",\"category\":\"sales\",\"subcategory\":\"beverages\",\"amount\":100}"
    → 201, customers 0
  curl.exe -s -X POST localhost:3001/api/data/reset -H "Content-Type: application/json" -d "{\"mode\":\"demo\"}"
    → { "mode": "demo", "entries": 192 }
Then commit "Backend: food/beverages/orders earnings, optional customers, reset endpoint" and push.
```

---

## Step 2: Frontend foundation (API client, types, formatting, month picker)

```text
Work only in my-react-router-app/. Before writing code, read
my-react-router-app/.agents/skills/react-router/SKILL.md and use its React Router 8
framework-mode APIs. TypeScript. No new dependencies (recharts is already installed).

Create these files. Do not edit existing routes or components in this step.

1. app/lib/types.ts — types that mirror the backend JSON exactly:
   CostCategory = "utilities" | "hidden" | "food" | "salaries"
   EarningCategory = "food" | "beverages" | "orders"
   Status = "green" | "yellow" | "red" | null
   Entry { id; month; type: "cost" | "revenue"; category; subcategory; amount; count?; payPerPerson?; customers?; note? }
   Summary { month; totalRevenue; totalCosts; netProfit; profitMargin: number|null; customers;
             avgSpendPerCustomer: number|null; costsByCategory: Record<CostCategory, number>;
             ratios: Record<"foodCostPercent"|"laborCostPercent"|"primeCostPercent", { value: number|null; status: Status }> }
   HistoryRow = Omit<Summary, "ratios">
   Costs { month; total; byCategory; bySubcategory; staff; entries: Entry[] }
   Revenue { month; total; customers; avgSpendPerCustomer; bySubcategory: Record<EarningCategory, number>;
             customersBySubcategory; entries: Entry[] }

2. app/lib/api.ts
   API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"
   class ApiError extends Error { status: number }
   A private request<T>(path, init?) helper: on a network failure, throw ApiError status 0 with the message
   "Can't reach the backend at <API_URL>. Start it with: cd Backend; npm start".
   On a non-2xx response, throw ApiError with the backend's { error } text.
   Export: getSummary(month), getHistory(), getCosts(month), getRevenue(month),
           createEntry(body), deleteEntry(id), resetData(mode: "empty" | "demo").

3. app/lib/format.ts
   formatMoney(n, decimals = 0) → en-CA, CAD (same as fmtCurrency in routes/forecast.tsx)
   formatPercent(n|null) → "17.4%" or "—"
   monthLabel("2026-09") → "September 2026"; shortMonth("2026-09") → "Sep"
   Build dates with new Date(year, monthIndex, 1). Never new Date("2026-09"), which has timezone bugs.

4. app/lib/categories.ts — the single source for labels and colors, reusing the existing
   .transaction-avatar tone colors from app/app.css:
   COST_CATEGORIES (same keys/subcategories as Backend/src/constants.js)
   EARNING_SUBCATEGORIES = ["food", "beverages", "orders"]
   COST_META: utilities {label "Utilities", color "#32734e", tone "cost-utilities"},
              food {label "Food inventory", color "#a76624", tone "cost-food"},
              salaries {label "Salaries", color "#496991", tone "cost-salary"},
              hidden {label "Hidden costs", color "#a95f5d", tone "cost-hidden"}
   EARNING_META: food {label "Food", color "#367a4b", tone "earning-food"},
                 beverages {label "Beverages", color "#788233", tone "earning-beverage"},
                 orders {label "Delivery & takeout orders", color "#387e77", tone "earning-delivery"}
   SUBCATEGORY_LABELS for every subcategory ("furniture-damage" → "Furniture damage", etc.)
   CHART_COLORS: revenue "#5DC07E", costs "#a95f5d", margin "#173f32", grid "#dfe9e5", axis "#7a8885"

5. app/lib/month.ts: resolveMonth(request, history): use ?month=YYYY-MM if it is valid;
   otherwise use the latest month in history; otherwise use the current month.

6. app/components/month-picker.tsx: <input type="month"> bound to the ?month= search param
   (useSearchParams, keeping other params). Styled to match .topline-select in app/app.css.
   Put its CSS in app/styles/shared.css and import that file from the component.

7. app/components/backend-error.tsx: a themed .content-panel.empty-state-panel that shows the
   error message and a "Try again" button (useRevalidator). Pages will use it in ErrorBoundary.

Checks, all must pass before committing:
  cd my-react-router-app; npm run typecheck; npm run build   → no errors
Commit "Frontend: API client, types, formatting, month picker" and push.
```

---

## Step 3: Home page (revenue vs expenses bar chart + profit margin)

```text
Work in my-react-router-app/. Files you own: app/routes/home.tsx, app/components/home/*,
app/styles/home.css. Do NOT edit app/components/dashboard-widgets.tsx (routes/section.tsx still
uses it) or app/app.css. Reuse existing CSS classes (.overview-page, .balance-card, .content-panel,
.panel-heading, .activity-tabs, .transaction-row) so the page keeps the EZ Money look.

1. app/routes/home.tsx
   export async function clientLoader({ request }) → getHistory(), resolveMonth(request, history),
   then getSummary(month) and getRevenue(month) with Promise.all. Return { month, history, summary, revenue }.
   clientLoader.hydrate = true as const; export HydrateFallback (a themed loading panel);
   export ErrorBoundary rendering <BackendError />.
   Layout: .overview-page. Main column: MonthPicker, RevenueCard, RevenueExpenseChart, MonthActivity.
   Side column: HealthCard.

2. app/components/home/revenue-card.tsx: a real-data version of BalanceCard (same .balance-* classes).
   Shows revenue for the month, "↗/↘ x.x% vs <previous month>" computed from history (hidden if there
   is no previous month), and the sparkline bars scaled from the last 12 months of history.totalRevenue.

3. app/components/home/revenue-expense-chart.tsx: recharts ComposedChart in a .content-panel,
   titled "Revenue vs expenses". Data = history (last 12 months). Two bars: totalRevenue
   (CHART_COLORS.revenue) and totalCosts (CHART_COLORS.costs), radius [6,6,0,0]. One line:
   profitMargin on a right-hand Y axis in %, CHART_COLORS.margin, with dots. X labels use shortMonth.
   Tooltip uses formatMoney and formatPercent. Legend: Revenue, Expenses, Profit margin. Highlight
   the selected month's bars (full opacity; other months 0.55). Wrap it in ResponsiveContainer, height 300.
   If history is empty, show "No data yet. Add your first transaction." with a Link to /transactions.

4. app/components/home/health-card.tsx: a .content-panel titled "Business health".
   Large profit margin + label: <0 "Losing money", <10 "Dangerously thin", <15 "Tight",
   <=20 "Healthy", >20 "Strong". Show net profit under it (red if negative).
   Then 3 rows (Food cost, Labor cost, Prime cost): value, a colored status dot
   (green #459b63 / yellow #c9a227 / red #a95f5d), and the sentence
   "$0.30 of every $1 goes to <ingredients | wages | food and labor>". Targets: 35%, 35%, 65%.
   null values show "—" and no dot.

5. app/components/home/month-activity.tsx: the same Costs/Earnings tab UI as TransactionsList
   (copy its markup and keyboard handling), but with real data. Costs tab = 4 rows from
   summary.costsByCategory using COST_META (avatar tone, label, amount). Earnings tab = 3 rows from
   revenue.bySubcategory using EARNING_META. Tab headers show the totals. "View all" is a <Link>
   (not <a href>) to /transactions?month=<month>.

6. Update meta() title to "EZ Money | Overview".

Checks, all must pass before committing:
  cd my-react-router-app; npm run typecheck; npm run build
  Run both: (Backend) npm run seed; npm start   and   (my-react-router-app) npm run dev
  Open http://localhost:5173 and verify:
   - Revenue $42,000 for September 2026; 12 bar pairs; March 2026 shows a visible dip in margin
   - Margin 17.4% "Healthy"; Food 30.0% green, Labor 37.1% yellow, Prime 67.1% yellow
   - Changing the month picker to 2026-03 updates every card and highlights March
   - Stopping the backend and reloading shows the BackendError panel, not a crash
Commit "Home: live revenue/expense chart, profit margin, health card" and push.
```

---

## Step 4: Transactions page (two pie charts + user input)

```text
Work in my-react-router-app/. Files you own: app/routes/transactions.tsx,
app/components/transactions/*, app/styles/transactions.css, and ONE line in app/routes.ts.
Do not edit section.tsx, dashboard-widgets.tsx, or app/app.css.

1. app/routes.ts: add route("transactions", "routes/transactions.tsx") inside the dashboard layout,
   ABOVE the ":section" route.

2. app/routes/transactions.tsx
   clientLoader: history → resolveMonth → Promise.all(getCosts, getRevenue, getSummary).
   clientLoader.hydrate = true; HydrateFallback; ErrorBoundary → <BackendError />.
   clientAction({ request }): read formData.get("intent"):
     "create" → build the JSON body and call createEntry. IMPORTANT: FormData values are strings,
                and the backend rejects "900". Convert amount, count, payPerPerson and customers with
                Number(). Omit empty fields. Salaries send count + payPerPerson and NO amount.
                Earnings send category "sales".
     "delete" → deleteEntry(Number(id))
     "reset"  → resetData(mode)
     On ApiError, return { error: message }. On success, return { ok: true, intent }.
   Loaders revalidate automatically after the action, so the charts update without extra code.
   Layout (top to bottom):
     a) .section-summary header: eyebrow "EZ MONEY · <MONTH LABEL>", title "Your transactions",
        MonthPicker, an "Add transaction" button that toggles the form, and a stat showing net income
        (formatMoney(summary.netProfit)), labeled "Net income this month".
     b) Two-column grid (one column under 900px): <BreakdownPie> for Costs and for Earnings.
     c) <TransactionForm> panel (shown when toggled, or when the month has no entries at all).
     d) <EntryList>.
     e) A small "Your data" panel: "Clear all data" (mode empty) and "Load demo data" (mode demo)
        buttons using useFetcher, each behind window.confirm().

3. app/components/transactions/breakdown-pie.tsx
   Props: title, subtitle, total, slices: { key, label, value, color }[].
   recharts PieChart donut (innerRadius 62%, outerRadius 90%, paddingAngle 2), with the total
   (formatMoney) in the center. Legend rows under the chart: color dot, label, amount, and percent =
   value / total × 100 to 1 decimal. Slices with value 0 are hidden from the donut but still listed
   in the legend at 0%. Tooltip shows label, amount and %. If total is 0, show an empty ring
   and "Nothing recorded for this month yet."
   Costs pie: title "Costs", subtitle "Utilities · Food · Salaries · Hidden costs", slices from
   costs.byCategory + COST_META. Earnings pie: title "Earnings", subtitle "Food · Beverages · Orders",
   slices from revenue.bySubcategory + EARNING_META.

4. app/components/transactions/transaction-form.tsx — <Form method="post"> with hidden intent=create.
   Fields: Type toggle (Cost / Earning), Month (defaults to the selected month).
   Cost → Category select (COST_META labels) → Subcategory select (SUBCATEGORY_LABELS, updates
   when the category changes). For "salaries": Number of staff + Monthly pay per person, with a
   live "= $X / month" preview. Otherwise: Amount.
   Earning → Category select (EARNING_META labels), Amount, Customers served (optional).
   Note (optional, maxLength 200). Inputs: type="number", min, step.
   Show useActionData().error in a red inline message. After a successful create, reset the form
   and keep the panel open, so several entries can be added quickly. Disable submit while
   navigation.state !== "idle".

5. app/components/transactions/entry-list.tsx — tabs (reuse .activity-tabs markup) for Costs /
   Earnings, listing the individual entries from costs.entries / revenue.entries with
   .transaction-row: avatar tone from the META, subcategory label, category label (salaries show
   "2 × $3,200"), note if present, and the amount (formatMoney(n, 2); costs use .is-cost,
   earnings use .is-incoming). Each row gets a delete button (useFetcher, intent=delete,
   window.confirm). Empty tab → "No costs/earnings recorded for this month."

Checks, all must pass before committing:
  cd my-react-router-app; npm run typecheck; npm run build
  Backend running (npm run seed first) + npm run dev. Open http://localhost:5173/transactions and verify:
   - Costs pie: Salaries $15,600 45.0%, Food inventory $12,600 36.3%, Utilities $5,200 15.0%, Hidden $1,300 3.7%
   - Earnings pie: Food $26,000 61.9%, Beverages $9,000 21.4%, Orders $7,000 16.7%
   - Add Cost → Hidden costs → Other → $150: the Costs pie total becomes $34,850 immediately
   - Add Salaries → Waiter, 1 × $1,800: the salaries slice grows by $1,800
   - Add Earning → Beverages $500 with no customers: saved, and the Earnings pie updates
   - Amount left empty → an inline error, no crash
   - Delete the $150 entry → the total returns to $34,700
   - Go Home → the bar chart and margin reflect the same changes
   - "Clear all data" → both pies empty, form shown; "Load demo data" → numbers restored
Commit "Transactions: cost/earning pie charts and entry form wired to backend" and push.
```

---

## Step 5: Clean-up and merge

```text
Work in my-react-router-app/.
1. app/components/sidebar.tsx: remove the hardcoded nav-count "4" badge on Transactions.
2. app/routes/section.tsx: remove the "/transactions" entry from the pages map (the dedicated route
   handles it now). Leave the other sections as they are.
3. grep for "href=\"/" in app/ and switch internal links to <Link> or <NavLink>.
4. Add my-react-router-app/.env.example containing VITE_API_URL=http://localhost:3001.
5. Replace README.md "How to run" with: two terminals —
   Backend: cd Backend; npm install; npm run seed; npm start (port 3001)
   Frontend: cd my-react-router-app; npm install; npm run dev (port 5173)

Final checks, all must pass:
  cd Backend; npm test                                   → fail 0
  cd my-react-router-app; npm run typecheck; npm run build → no errors
  Full walkthrough of the Step 3 and Step 4 browser checks, then npm run seed to reset the demo data.
Commit "Clean-up: links, sidebar badge, README run instructions", push, then open a PR front-end → main.
```
