import type { ValuateRequest, Comp } from "@/lib/validation";

const SOURCES = ["AutoTrader", "Cars.com", "CarGurus", "Edmunds", "Craigslist"];

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

export function getMockComps(req: ValuateRequest): Comp[] {
  const seed =
    req.year * 31 +
    req.mileage +
    req.make.charCodeAt(0) +
    req.model.charCodeAt(0);
  const rand = seededRandom(seed);

  // Base price heuristic: newer & lower mileage = higher price
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

  const count = 5 + Math.floor(rand() * 3); // 5–7 comps
  const comps: Comp[] = [];

  for (let i = 0; i < count; i++) {
    const variance = 0.85 + rand() * 0.3; // ±15% spread
    const compMileage = Math.max(
      0,
      Math.round(req.mileage * (0.7 + rand() * 0.6))
    );
    const compPrice = Math.round(adjustedBase * variance / 100) * 100;
    const source = SOURCES[Math.floor(rand() * SOURCES.length)];
    const trim = req.trim ? ` ${req.trim}` : "";

    comps.push({
      title: `${req.year} ${req.make} ${req.model}${trim}`,
      price: compPrice,
      mileage: compMileage,
      location: req.location,
      source,
      url: `https://www.${source.toLowerCase().replace(".", "")}.com/listing/placeholder-${i + 1}`,
      postedDate: formatDate(Math.floor(rand() * 30)),
    });
  }

  return comps;
}
