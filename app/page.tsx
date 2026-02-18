"use client";

import { useState, FormEvent } from "react";
import type { ValuateResponse } from "@/lib/validation";

type FormState = {
  make: string;
  model: string;
  year: string;
  trim: string;
  mileage: string;
  condition: string;
  location: string;
};

const INITIAL_FORM: FormState = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  trim: "",
  mileage: "",
  condition: "good",
  location: "",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const fmtMiles = (n: number) =>
  new Intl.NumberFormat("en-US").format(n) + " mi";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function PriceColumn({
  label,
  value,
  primary,
  muted,
}: {
  label: string;
  value: number;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex-1 ${muted ? "opacity-70" : ""}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`font-bold ${
          primary ? "text-3xl text-blue-600" : "text-xl text-gray-700"
        }`}
      >
        {fmt(value)}
      </p>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuateResponse | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrors([]);

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: parseInt(form.year, 10),
      trim: form.trim.trim() || undefined,
      mileage: parseInt(form.mileage, 10),
      condition: form.condition,
      location: form.location.trim(),
    };

    try {
      const res = await fetch("/api/valuate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msgs: string[] = data.details ?? [
          data.error ?? "Something went wrong.",
        ];
        setErrors(msgs);
      } else {
        setResult(data as ValuateResponse);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setLoading(false);
    }
  }

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;
  const confidenceColor =
    confidencePct >= 80
      ? "text-green-600"
      : confidencePct >= 65
      ? "text-yellow-600"
      : "text-red-500";

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Car Valuator</h1>
          <p className="mt-1 text-gray-500">
            Get an instant market estimate for any vehicle.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Make" required>
              <input
                name="make"
                value={form.make}
                onChange={handleChange}
                placeholder="Toyota"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Model" required>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Camry"
                required
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" required>
              <input
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
                min={1980}
                max={new Date().getFullYear() + 1}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Trim (optional)">
              <input
                name="trim"
                value={form.trim}
                onChange={handleChange}
                placeholder="XLE, Sport…"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Mileage" required>
              <input
                name="mileage"
                type="number"
                value={form.mileage}
                onChange={handleChange}
                placeholder="45000"
                min={0}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Condition" required>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </Field>
          </div>

          <Field label="Location (ZIP or City, State)" required>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="90210 or Los Angeles, CA"
              required
              className={inputCls}
            />
          </Field>

          {errors.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 space-y-1">
              {errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 transition-colors"
          >
            {loading ? "Calculating…" : "Get Valuation"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Price range card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Market Estimate
                </h2>
                <span className={`text-sm font-medium ${confidenceColor}`}>
                  {confidencePct}% confidence
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 text-center">
                <PriceColumn label="Low" value={result.priceLow} muted />
                <PriceColumn label="Mid (est.)" value={result.priceMid} primary />
                <PriceColumn label="High" value={result.priceHigh} muted />
              </div>

              <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 w-full" />
              </div>
            </div>

            {/* Comparable listings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comparable Listings ({result.comps.length})
              </h2>
              <div className="space-y-3">
                {result.comps.map((comp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {comp.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmtMiles(comp.mileage)} &middot; {comp.location}
                        {comp.postedDate && ` · Listed ${comp.postedDate}`}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end shrink-0">
                      <span className="font-semibold text-gray-900">
                        {fmt(comp.price)}
                      </span>
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-0.5"
                      >
                        {comp.source}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Estimates are based on mock data and are for informational
              purposes only.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
