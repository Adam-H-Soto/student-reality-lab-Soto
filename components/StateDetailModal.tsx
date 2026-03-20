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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="h-full w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 bg-white px-6 py-4 flex items-center justify-between border-b transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatted.stateName} ({formatted.stateCode})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatted.metadata.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Taxes
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Income Tax</p>
                  <p className="text-xl font-bold text-blue-700">{formatted.taxes.incomeTax}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sales Tax</p>
                  <p className="text-xl font-bold text-blue-700">{formatted.taxes.salesTax}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Property Tax</p>
                  <p className="text-xl font-bold text-blue-700">{formatted.taxes.propertyTax}</p>
                </div>
              </div>
            </section>

            {/* Income Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Income
              </h3>
              <div className="bg-green-50 p-5 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Median Household Income</p>
                <p className="text-2xl font-bold text-green-700 mb-3">{formatted.income.medianHouseholdIncome}</p>
                <p className="text-xs text-gray-500">Source: {formatted.income.source} ({formatted.income.year})</p>
              </div>
            </section>

            {/* Housing Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                Housing
              </h3>
              <div className="bg-amber-50 p-5 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Median Home Price</p>
                <p className="text-2xl font-bold text-amber-700 mb-3">{formatted.housing.medianHomePrice}</p>
                <p className="text-xs text-gray-500">Source: {formatted.housing.source}</p>
              </div>
            </section>

            {/* Lifestyle Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: formatted.colors.safety }}
                ></span>
                Lifestyle & Safety
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nightlife Score</p>
                    <p className="text-xl font-bold text-purple-700">{formatted.lifestyle.nightlifeScore}</p>
                  </div>
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: formatted.colors.safety, backgroundColor: formatted.colors.safety + "10" }}>
                    <p className="text-sm text-gray-600 mb-1">Safety Index</p>
                    <p className="text-xl font-bold" style={{ color: formatted.colors.safety }}>
                      {formatted.lifestyle.safetyIndex}
                    </p>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Crime Rate</p>
                  <p className="text-lg font-bold text-red-700">{formatted.lifestyle.crimeRate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Top Industries</p>
                  <p className="text-base text-gray-800">{formatted.lifestyle.topIndustries}</p>
                </div>
                <p className="text-xs text-gray-500">Source: {formatted.lifestyle.source}</p>
              </div>
            </section>

            {/* Food & Grocery Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span
                  className="w-2 h-2 rounded-full mr-3"
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
                  <p className="text-sm text-gray-600 mb-1">Food Insecurity Rate</p>
                  <p className="text-2xl font-bold" style={{ color: formatted.colors.affordability }}>
                    {formatted.food.insecurityRate}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Grocery Cost Index</p>
                  <p className="text-lg font-bold text-orange-700">{formatted.food.groceryCostIndex}</p>
                </div>
              </div>
            </section>

            {/* Data Quality Note */}
            <section className="pt-4 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> This data combines multiple sources including government databases, tax records, and public datasets. Some values marked as &quot;Data unavailable&quot; indicate fields where reliable data is not currently accessible. All monetary values are in USD.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
