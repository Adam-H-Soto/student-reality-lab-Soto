"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
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
      <main className="min-h-screen w-full bg-linear-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-[48px] font-bold text-[#212121]">
              Income & Housing Data
            </h1>
            <p className="text-[18px] leading-7 text-[#757575]">
              Compare median household income and housing prices to understand cost of living and affordability
            </p>
          </div>

          {/* Sort Controls */}
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-md">
            <label className="text-[16px] font-bold text-[#212121]">
              Sort by:
            </label>
            <div className="mt-3 flex gap-4">
              <button
                onClick={() => handleSortClick("income")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "income"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Income{getSortIndicator("income")}
              </button>
              <button
                onClick={() => handleSortClick("housing")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "housing"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Housing Prices{getSortIndicator("housing")}
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="text-center text-[18px] text-[#757575]">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-[#4b5563]">
                Sorting by <span className="font-bold text-[#1f2937]">{sortBy === "income" ? "Median Income" : "Median Home Price"}</span>,{" "}
                <span className="font-bold text-[#1f2937]">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-green-600 text-white">
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
                      <td className="px-6 py-4 font-semibold text-[#212121]">
                        {state.state}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatCurrency(state.income.median_household_income)}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatCurrency(state.housing.median_home_price)}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {state.affordability ? (
                          <span className={state.affordability > 8 ? "text-red-600" : state.affordability > 5 ? "text-orange-600" : "text-green-600"}>
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
          <div className="mt-8 rounded-lg bg-green-50 p-6 border-l-4 border-green-600">
            <h3 className="text-[18px] font-bold text-[#212121] mb-2">Understanding Affordability</h3>
            <p className="text-[14px] text-[#757575]">
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
