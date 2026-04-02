"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import type { UnifiedStateData } from "@/lib/schema";
import { formatCurrency } from "@/lib/formatData";

export default function StateIncomeHousingPage() {
  const [states, setStates] = useState<UnifiedStateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"income" | "housing">("income");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/states");
        const { data } = await response.json();
        setStates(data.sort((a: UnifiedStateData, b: UnifiedStateData) => 
          a.state.localeCompare(b.state)
        ));
      } catch (error) {
        console.error("Failed to fetch state data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedStates = [...states].sort((a, b) => {
    if (sortBy === "income") {
      const incomeA = a.income.median_household_income || 0;
      const incomeB = b.income.median_household_income || 0;
      return sortDirection === "desc" ? incomeB - incomeA : incomeA - incomeB;
    } else {
      const priceA = a.housing.median_home_price || 0;
      const priceB = b.housing.median_home_price || 0;
      return sortDirection === "desc" ? priceB - priceA : priceA - priceB;
    }
  });

  const handleSortClick = (field: "income" | "housing") => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }

    setSortBy(field);
    setSortDirection("desc");
  };

  const getSortIndicator = (field: "income" | "housing") => {
    if (sortBy !== field) return "";
    return sortDirection === "desc" ? " ↓" : " ↑";
  };

  // Calculate affordability ratio (housing price to income)
  const statesWithAffordability = sortedStates.map(state => ({
    ...state,
    affordability: state.housing.median_home_price && state.income.median_household_income
      ? state.housing.median_home_price / state.income.median_household_income
      : null
  }));

  return (
    <>
      <Navigation />
      <main className="min-h-screen w-full bg-transparent">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex rounded-full border border-[#d6e0d2] bg-white px-4 py-2 text-sm text-[#4b5f68] transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            ← Back to Home
          </Link>
          <div className="mb-12 max-w-3xl">
            <h1 className="mb-4 text-[44px] font-semibold text-slate-900">
              Income and Housing Snapshot
            </h1>
            <p className="text-[18px] leading-7 text-slate-600">
              Explore how income and home prices line up across states. Feel free to switch sorting at any point.
            </p>
            <p className="mt-2 text-sm text-[#76828a]">Neighbors often use this view together to compare affordability patterns.</p>
          </div>

          {/* Sort Controls */}
          <div className="mb-10 rounded-2xl border border-[#d8e3d8] bg-white p-7 shadow-[0_6px_18px_rgba(95,143,160,0.08)]">
            <label className="text-[16px] font-semibold text-slate-900">
              Sort by:
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleSortClick("income")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "income"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Income{getSortIndicator("income")}
              </button>
              <button
                onClick={() => handleSortClick("housing")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "housing"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Housing Prices{getSortIndicator("housing")}
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="text-center text-[18px] text-slate-600">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-slate-600">
                Showing <span className="font-semibold text-slate-800">{sortBy === "income" ? "Median Income" : "Median Home Price"}</span>,{" "}
                <span className="font-semibold text-slate-800">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="overflow-hidden rounded-2xl border border-[#d8e3d8] bg-white shadow-[0_6px_18px_rgba(95,143,160,0.08)]">
              <table className="w-full">
                <thead className="bg-[#6a8f80] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">State</th>
                    <th className="px-6 py-4 text-center font-bold">Median Income</th>
                    <th className="px-6 py-4 text-center font-bold">Median Home Price</th>
                    <th className="px-6 py-4 text-center font-bold">Affordability Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {statesWithAffordability.map((state, idx) => (
                    <tr
                      key={state.state}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {state.state}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {formatCurrency(state.income.median_household_income)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {formatCurrency(state.housing.median_home_price)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {state.affordability ? (
                          <span className={state.affordability > 8 ? "text-red-700" : state.affordability > 5 ? "text-amber-700" : "text-slate-700"}>
                            {state.affordability.toFixed(1)}x
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="mt-10 rounded-2xl border-l-4 border-[#e7b576] bg-[#fff8ed] p-7">
            <h3 className="mb-2 text-[18px] font-semibold text-slate-900">Understanding Affordability</h3>
            <p className="text-[14px] text-slate-600">
              The affordability ratio shows how many times the median home price is compared to median household income.
              Lower ratios indicate better affordability (easier to purchase a home). For example, a ratio of 3.0x means 
              the median home price is 3 times the annual household income. Generally, ratios below 4.0x are considered 
              good affordability. Data source: US Census Bureau, Real Estate Market Data.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
