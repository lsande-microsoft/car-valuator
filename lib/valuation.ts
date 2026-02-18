import type { ValuateRequest, ValuateResponse } from "@/lib/validation";
import { getMockComps } from "@/lib/providers/mockProvider";

const CONDITION_CONFIDENCE: Record<string, number> = {
  excellent: 0.9,
  good: 0.82,
  fair: 0.72,
  poor: 0.6,
};

export function computeValuation(req: ValuateRequest): ValuateResponse {
  const comps = getMockComps(req);
  const prices = comps.map((c) => c.price);

  // Average comp price as mid estimate
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Mileage adjustment: every 10k miles over 50k → –1% (capped at –20%)
  const mileageOver = Math.max(0, req.mileage - 50_000);
  const mileageAdj = Math.max(-0.2, -(mileageOver / 10_000) * 0.01);

  // Year adjustment: each year over 5 old → –0.5% (capped at –15%)
  const ageYears = Math.max(0, new Date().getFullYear() - req.year - 5);
  const ageAdj = Math.max(-0.15, -(ageYears * 0.005));

  const priceMid = Math.round((avgPrice * (1 + mileageAdj + ageAdj)) / 100) * 100;

  const confidence = CONDITION_CONFIDENCE[req.condition] ?? 0.75;

  // Range spreads inversely with confidence: low confidence → wider band
  const spreadLow = 0.08 + (1 - confidence) * 0.07;  // 8–15%
  const spreadHigh = 0.08 + (1 - confidence) * 0.07;

  const priceLow = Math.round((priceMid * (1 - spreadLow)) / 100) * 100;
  const priceHigh = Math.round((priceMid * (1 + spreadHigh)) / 100) * 100;

  return {
    priceLow,
    priceMid,
    priceHigh,
    currency: "USD",
    confidence,
    comps,
  };
}
