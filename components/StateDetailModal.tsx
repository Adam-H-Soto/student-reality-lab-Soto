"use client";

import { useState, useEffect } from "react";
import type { UnifiedStateData } from "@/lib/schema";
import { formatStateDataForDisplay } from "@/lib/formatData";

interface StateDetailModalProps {
  state: UnifiedStateData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StateDetailModal({ state, isOpen, onClose }: StateDetailModalProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrolled(target.scrollTop > 0);
    };

    const modal = document.querySelector(".state-modal-content");
    modal?.addEventListener("scroll", handleScroll);
    return () => modal?.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isOpen || !state) return null;

  const formatted = formatStateDataForDisplay(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {formatted.stateName} ({formatted.stateCode})
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Last updated: {formatted.metadata.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-semibold text-slate-500 hover:text-slate-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="state-modal-content overflow-y-auto flex-1">
          <div className="px-6 py-6 space-y-8">
            {/* Taxes Section */}
            <section>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                <span className="mr-3 h-2 w-2 rounded-full bg-slate-700"></span>
                Taxes
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-600">Income Tax</p>
                  <p className="text-xl font-semibold text-slate-800">{formatted.taxes.incomeTax}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-600">Sales Tax</p>
                  <p className="text-xl font-semibold text-slate-800">{formatted.taxes.salesTax}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-600">Property Tax</p>
                  <p className="text-xl font-semibold text-slate-800">{formatted.taxes.propertyTax}</p>
                </div>
              </div>
            </section>

            {/* Income Section */}
            <section>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                <span className="mr-3 h-2 w-2 rounded-full bg-slate-700"></span>
                Income
              </h3>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="mb-1 text-sm text-slate-600">Median Household Income</p>
                <p className="mb-3 text-2xl font-semibold text-slate-800">{formatted.income.medianHouseholdIncome}</p>
                <p className="text-xs text-slate-500">Source: {formatted.income.source} ({formatted.income.year})</p>
              </div>
            </section>

            {/* Housing Section */}
            <section>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                <span className="mr-3 h-2 w-2 rounded-full bg-slate-700"></span>
                Housing
              </h3>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="mb-1 text-sm text-slate-600">Median Home Price</p>
                <p className="mb-3 text-2xl font-semibold text-slate-800">{formatted.housing.medianHomePrice}</p>
                <p className="text-xs text-slate-500">Source: {formatted.housing.source}</p>
              </div>
            </section>

            {/* Lifestyle Section */}
            <section>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                <span
                  className="mr-3 h-2 w-2 rounded-full"
                  style={{ backgroundColor: formatted.colors.safety }}
                ></span>
                Lifestyle & Safety
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-sm text-slate-600">Nightlife Score</p>
                    <p className="text-xl font-semibold text-slate-800">{formatted.lifestyle.nightlifeScore}</p>
                  </div>
                  <div className="rounded-lg border-2 p-4" style={{ borderColor: formatted.colors.safety, backgroundColor: formatted.colors.safety + "10" }}>
                    <p className="mb-1 text-sm text-slate-600">Safety Index</p>
                    <p className="text-xl font-semibold" style={{ color: formatted.colors.safety }}>
                      {formatted.lifestyle.safetyIndex}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-600">Crime Rate</p>
                  <p className="text-lg font-semibold text-slate-800">{formatted.lifestyle.crimeRate}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-sm text-slate-600">Top Industries</p>
                  <p className="text-base text-slate-800">{formatted.lifestyle.topIndustries}</p>
                </div>
                <p className="text-xs text-slate-500">Source: {formatted.lifestyle.source}</p>
              </div>
            </section>

            {/* Food & Grocery Section */}
            <section>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                <span
                  className="mr-3 h-2 w-2 rounded-full"
                  style={{ backgroundColor: formatted.colors.affordability }}
                ></span>
                Food Insecurity & Affordability
              </h3>
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg border-2"
                  style={{
                    borderColor: formatted.colors.affordability,
                    backgroundColor: formatted.colors.affordability + "10"
                  }}
                >
                  <p className="mb-1 text-sm text-slate-600">Food Insecurity Rate</p>
                  <p className="text-2xl font-semibold" style={{ color: formatted.colors.affordability }}>
                    {formatted.food.insecurityRate}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm text-slate-600">Grocery Cost Index</p>
                  <p className="text-lg font-semibold text-slate-800">{formatted.food.groceryCostIndex}</p>
                </div>
              </div>
            </section>

            {/* Data Quality Note */}
            <section className="border-t border-slate-200 pt-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  <strong>Note:</strong> This data combines multiple sources including government databases, tax records, and public datasets. Some values marked as &quot;Data unavailable&quot; indicate fields where reliable data is not currently accessible. All monetary values are in USD.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
