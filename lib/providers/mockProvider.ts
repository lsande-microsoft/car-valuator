import type { ValuateRequest, Comp } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Deep-link URL builders — each generates a targeted search results page
// pre-filled with the user's make/model/year/location/mileage.
// These are NOT individual listing links; they are search deep links.
// ---------------------------------------------------------------------------

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function buildAutoTraderUrl(req: ValuateRequest): string {
  const params = new URLSearchParams({
    zip: req.location,
    startYear: String(req.year - 1),
    endYear: String(req.year + 1),
    maxMileage: String(req.mileage + 20_000),
  });
  const make = slug(req.make);
  const model = slug(req.model);
  return `https://www.autotrader.com/cars-for-sale/used-cars/${make}/${model}?${params}`;
}

function buildCarsDotComUrl(req: ValuateRequest): string {
  const makeSlug = slug(req.make);
  const modelSlug = `${makeSlug}-${slug(req.model)}`;
  const params = new URLSearchParams({
    make_slug: makeSlug,
    model_slug: modelSlug,
    mileage_max: String(req.mileage + 20_000),
    stock_type: "used",
    year_max: String(req.year + 1),
    year_min: String(req.year - 1),
    zip: req.location,
  });
  return `https://www.cars.com/shopping/results/?${params}`;
}

function buildCarGurusUrl(req: ValuateRequest): string {
  const query = encodeURIComponent(`${req.year} ${req.make} ${req.model}`);
  const params = new URLSearchParams({
    zip: req.location,
    distance: "100",
    ...(req.trim ? { trim: req.trim } : {}),
    maxMileage: String(req.mileage + 20_000),
    minYear: String(req.year - 1),
    maxYear: String(req.year + 1),
  });
  return `https://www.cargurus.com/Cars/new/nl?q=${query}&${params}`;
}

function buildFacebookMarketplaceUrl(req: ValuateRequest): string {
  const query = encodeURIComponent(`${req.year} ${req.make} ${req.model}`);
  return `https://www.facebook.com/marketplace/category/vehicles?query=${query}&exact=false`;
}

function buildCraigslistUrl(req: ValuateRequest): string {
  const params = new URLSearchParams({
    auto_make_model: `${req.make} ${req.model}`,
    min_auto_year: String(req.year - 1),
    max_auto_year: String(req.year + 1),
    max_auto_miles: String(req.mileage + 20_000),
    query: `${req.year} ${req.make} ${req.model}`,
  });
  return `https://craigslist.org/search/cta?${params}`;
}

const PROVIDERS: Array<{
  source: string;
  buildUrl: (req: ValuateRequest) => string;
}> = [
  { source: "AutoTrader", buildUrl: buildAutoTraderUrl },
  { source: "Cars.com", buildUrl: buildCarsDotComUrl },
  { source: "CarGurus", buildUrl: buildCarGurusUrl },
  { source: "Facebook Marketplace", buildUrl: buildFacebookMarketplaceUrl },
  { source: "Craigslist", buildUrl: buildCraigslistUrl },
];

// ---------------------------------------------------------------------------
// Seeded RNG — ensures deterministic mock prices across renders
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function formatDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function getMockComps(req: ValuateRequest): Comp[] {
  const seed =
    req.year * 31 +
    req.mileage +
    req.make.charCodeAt(0) +
    req.model.charCodeAt(0);
  const rand = seededRandom(seed);

  const ageYears = new Date().getFullYear() - req.year;
  const basePrice = Math.max(
    3_000,
    30_000 - ageYears * 1_200 - req.mileage * 0.05
  );

  const conditionMultiplier: Record<string, number> = {
    excellent: 1.15,
    good: 1.0,
    fair: 0.85,
    poor: 0.7,
  };
  const adjustedBase = basePrice * conditionMultiplier[req.condition];
  const trim = req.trim ? ` ${req.trim}` : "";

  const comps: Comp[] = [];

  for (let i = 0; i < PROVIDERS.length; i++) {
    const provider = PROVIDERS[i];
    const variance = 0.85 + rand() * 0.3;
    const compMileage = Math.max(
      0,
      Math.round(req.mileage * (0.7 + rand() * 0.6))
    );
    const compPrice = Math.round((adjustedBase * variance) / 100) * 100;

    comps.push({
      title: `${req.year} ${req.make} ${req.model}${trim}`,
      price: compPrice,
      mileage: compMileage,
      location: req.location,
      source: provider.source,
      url: provider.buildUrl(req),
      linkType: "search",
      postedDate: formatDate(Math.floor(rand() * 30)),
    });
  }

  return comps;
}
