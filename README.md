# Car Valuator

An MVP web app that gives instant market price estimates for any vehicle, built with Next.js (App Router) + TypeScript + Tailwind CSS + Clerk Auth.

---

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in your Clerk keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

---

## Authentication (Clerk)

This app uses [Clerk](https://clerk.com) for user authentication. All routes except `/sign-in` and `/sign-up` require a signed-in user.

### Getting Clerk keys

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a new application.
2. Copy the **Publishable key** and **Secret key** from the API Keys page.
3. Add them to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Auth behavior

- Unauthenticated visitors hitting `/` are redirected to `/sign-in`.
- The navbar shows **Sign in / Sign up** when logged out and a **UserButton** (avatar + menu) when logged in.
- The API route `POST /api/valuate` is also protected by the middleware.

---

## How Valuation Works

This MVP uses a **mock provider** — no external APIs or scraping.

1. **Mock comps** (`lib/providers/mockProvider.ts`): Generates 5 synthetic comparable listings, one per source (AutoTrader, Cars.com, CarGurus, Facebook Marketplace, Craigslist). Prices are seeded deterministically from the vehicle inputs.

2. **Comp links are targeted search deep links** — each URL pre-fills the source site's search page with your make/model/year/location/mileage. They are **not** links to specific listings; clicking "View on AutoTrader →" opens a filtered search on autotrader.com for that vehicle.

3. **Core logic** (`lib/valuation.ts`):
   - Averages the comp prices as a mid estimate.
   - Applies heuristic adjustments: high mileage and older age pull the price down.
   - Confidence is set by condition (excellent → 90%, poor → 60%).
   - Spread (low/high range) widens as confidence decreases: roughly ±8–15%.

4. **Validation** (`lib/validation.ts`): Zod schema validates all inputs server-side and returns structured 400 errors on failure.

---

## Project Structure

```
middleware.ts                  # Clerk route protection
app/
  layout.tsx                   # ClerkProvider + Navbar wrapper
  page.tsx                     # UI: form + results
  components/
    Navbar.tsx                 # Auth navbar (SignIn/SignUp/UserButton)
  sign-in/[[...sign-in]]/
    page.tsx                   # Clerk SignIn component
  sign-up/[[...sign-up]]/
    page.tsx                   # Clerk SignUp component
  api/valuate/
    route.ts                   # POST /api/valuate — server handler
lib/
  validation.ts                # Zod schemas for request & response
  valuation.ts                 # Computes priceLow/Mid/High + confidence
  providers/
    mockProvider.ts            # Returns mock comps with deep-link URLs
```

---

## Adding Real Providers

To replace the mock with real data:

1. Create `lib/providers/yourProvider.ts` exporting `getComps(req: ValuateRequest): Promise<Comp[]>`.
2. Call it from `lib/valuation.ts` instead of `getMockComps`.
3. Add any API keys to `.env.local` (see `.env.example`).

Good real-data sources: Marketcheck API, DataOne, or CarGurus/AutoTrader APIs with appropriate terms compliance.

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel dashboard under **Settings → Environment Variables**, add all keys from `.env.example`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
4. Click **Deploy** — Vercel auto-detects Next.js.

Or via CLI:

```bash
npm i -g vercel
vercel
```

> **Note**: Without Clerk keys set in Vercel, the deployed app will throw a runtime error on page load. Always set env vars before deploying.
