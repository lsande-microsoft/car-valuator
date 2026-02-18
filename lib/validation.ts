import { z } from "zod";

export const conditionEnum = z.enum(["excellent", "good", "fair", "poor"]);

export const valuateRequestSchema = z.object({
  make: z.string().min(1, "Make is required").max(50),
  model: z.string().min(1, "Model is required").max(50),
  year: z
    .number()
    .int()
    .min(1980, "Year must be 1980 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  trim: z.string().max(50).optional(),
  mileage: z
    .number()
    .int()
    .min(0, "Mileage must be non-negative")
    .max(999_999, "Mileage seems too high"),
  condition: conditionEnum,
  location: z.string().min(1, "Location is required").max(100),
});

export type ValuateRequest = z.infer<typeof valuateRequestSchema>;

export const compSchema = z.object({
  title: z.string(),
  price: z.number(),
  mileage: z.number(),
  location: z.string(),
  source: z.string(),
  url: z.string(),
  postedDate: z.string().optional(),
});

export const valuateResponseSchema = z.object({
  priceLow: z.number(),
  priceMid: z.number(),
  priceHigh: z.number(),
  currency: z.string().default("USD"),
  confidence: z.number().min(0).max(1),
  comps: z.array(compSchema).min(3).max(8),
});

export type Comp = z.infer<typeof compSchema>;
export type ValuateResponse = z.infer<typeof valuateResponseSchema>;
