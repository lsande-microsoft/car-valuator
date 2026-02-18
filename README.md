# Car Valuator

An MVP web app that gives instant market price estimates for any vehicle, built with Next.js (App Router) + TypeScript + Tailwind CSS.

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

---

## How Valuation Works

This MVP uses a **mock provider** — no external APIs or scraping.

1. **Mock comps** (`lib/providers/mockProvider.ts`): Generates 5–7 synthetic comparable listings seeded deterministically from the vehicle inputs (make, model, year, mileage). Prices are based on a simple depreciation model.

2. **Core logic** (`lib/valuation.ts`):
   - Averages the comp prices as a mid estimate.
   - Applies heuristic adjustments: high mileage and older age pull the price down.
   - Confidence is set by condition (excellent → 90%, poor → 60%).
   - Spread (low/high range) widens as confidence decreases: roughly ±8–15%.

3. **Validation** (`lib/validation.ts`): Zod schema validates all inputs server-side and returns structured 400 errors on failure.

---

## Project Structure

```
app/
  page.tsx               # UI: form + results
  api/valuate/route.ts   # POST /api/valuate — server handler
  layout.tsx
lib/
  validation.ts          # Zod schemas for request & response
  valuation.ts           # Computes priceLow/Mid/High + confidence
  providers/
    mockProvider.ts      # Returns mock comparable listings
```

---

## Adding Real Providers

To replace the mock with real data:

1. Create `lib/providers/yourProvider.ts` exporting a `getComps(req: ValuateRequest): Promise<Comp[]>` function.
2. Call it from `lib/valuation.ts` instead of `getMockComps`.
3. Add any API keys to `.env.local` (see `.env.example`).

Good real-data sources to consider: Marketcheck API, DataOne, or scraping CarGurus/AutoTrader with appropriate terms compliance.

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add any environment variables from `.env.example` in the Vercel dashboard.
4. Click **Deploy** — Vercel auto-detects Next.js.

Or via CLI:

```bash
npm i -g vercel
vercel
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values as you add real providers.

```bash
cp .env.example .env.local
```
