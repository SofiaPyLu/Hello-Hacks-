# Hello Hacks 2026

EZ Money — a restaurant cost and revenue tracker. An Express API over a JSON file,
and a React Router 8 dashboard.

## How to run

Two terminals.

**Backend** (port 3001):

```powershell
cd Backend
npm install
npm run seed
npm start
```

**Frontend** (port 5173):

```powershell
cd my-react-router-app
npm install
npm run dev
```

Then open http://localhost:5173.

`npm run seed` writes 12 months of demo data. The frontend reads the API URL from
`VITE_API_URL` (see `my-react-router-app/.env.example`) and falls back to
`http://localhost:3001`. You can also clear or reload the demo data from the
"Your data" panel on the Transactions page.

## Tests

```powershell
cd Backend; npm test
cd my-react-router-app; npm run typecheck; npm run build
```
