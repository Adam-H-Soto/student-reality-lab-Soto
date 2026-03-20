"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import type { UnifiedStateData } from "@/lib/schema";
import { formatPercentage } from "@/lib/formatData";

export default function StateTaxesPage() {
  const [states, setStates] = useState<UnifiedStateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"income" | "sales" | "property">("income");
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

  const taxKeyMap = {
    income: "income_tax_rate",
    sales: "sales_tax_rate",
    property: "property_tax_rate",
  } as const;

  const sortedStates = [...states].sort((a, b) => {
    const taxKey = taxKeyMap[sortBy];
    const valueA = a.taxes[taxKey];
    const valueB = b.taxes[taxKey];

    if (valueA === null && valueB === null) return 0;
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    return sortDirection === "desc" ? valueB - valueA : valueA - valueB;
  });

  const handleSortClick = (field: "income" | "sales" | "property") => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }

    setSortBy(field);
    setSortDirection("desc");
  };

  const getSortIndicator = (field: "income" | "sales" | "property") => {
    if (sortBy !== field) return "";
    return sortDirection === "desc" ? " ↓" : " ↑";
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen w-full bg-linear-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-[48px] font-bold text-[#212121]">
              State Tax Rates
            </h1>
            <p className="text-[18px] leading-7 text-[#757575]">
              Compare income, sales, and property tax rates across all US states
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
                Income Tax{getSortIndicator("income")}
              </button>
              <button
                onClick={() => handleSortClick("sales")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "sales"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Sales Tax{getSortIndicator("sales")}
              </button>
              <button
                onClick={() => handleSortClick("property")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "property"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Property Tax{getSortIndicator("property")}
              </button>
            </div>
          </div>

          {/* Tax Table */}
          {loading ? (
            <div className="text-center text-[18px] text-[#757575]">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-[#4b5563]">
                Sorting by <span className="font-bold text-[#1f2937]">{sortBy === "income" ? "Income Tax" : sortBy === "sales" ? "Sales Tax" : "Property Tax"}</span>,{" "}
                <span className="font-bold text-[#1f2937]">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">State</th>
                    <th className="px-6 py-4 text-center font-bold">Income Tax</th>
                    <th className="px-6 py-4 text-center font-bold">Sales Tax</th>
                    <th className="px-6 py-4 text-center font-bold">Property Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStates.map((state, idx) => (
                    <tr
                      key={state.state}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 font-semibold text-[#212121]">
                        {state.state}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatPercentage(state.taxes.income_tax_rate, 2)}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatPercentage(state.taxes.sales_tax_rate, 2)}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatPercentage(state.taxes.property_tax_rate, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="mt-8 rounded-lg bg-blue-50 p-6 border-l-4 border-blue-600">
            <h3 className="text-[18px] font-bold text-[#212121] mb-2">About Tax Rates</h3>
            <p className="text-[14px] text-[#757575]">
              Tax rates vary significantly by state. Some states have no income tax (FL, TX, WA),
              while others have high income taxes (CA, NY, NJ). Property and sales taxes also vary widely.
              Use this data to compare total tax burden when considering relocation or business location decisions.
              Data sources: Tax Foundation, State Revenue Departments.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
