"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
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
              Taxes by State
            </h1>
            <p className="text-[18px] leading-7 text-slate-600">
              Compare tax levels across states and sort the table in whichever way helps most.
            </p>
            <p className="mt-2 text-sm text-[#76828a]">People across your area check this view to compare places before sharing local insights.</p>
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
                Income Tax{getSortIndicator("income")}
              </button>
              <button
                onClick={() => handleSortClick("sales")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "sales"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Sales Tax{getSortIndicator("sales")}
              </button>
              <button
                onClick={() => handleSortClick("property")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "property"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Property Tax{getSortIndicator("property")}
              </button>
            </div>
          </div>

          {/* Tax Table */}
          {loading ? (
            <div className="text-center text-[18px] text-slate-600">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-slate-600">
                Showing <span className="font-semibold text-slate-800">{sortBy === "income" ? "Income Tax" : sortBy === "sales" ? "Sales Tax" : "Property Tax"}</span>,{" "}
                <span className="font-semibold text-slate-800">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="overflow-hidden rounded-2xl border border-[#d8e3d8] bg-white shadow-[0_6px_18px_rgba(95,143,160,0.08)]">
              <table className="w-full">
                <thead className="bg-[#6a8f80] text-white">
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
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {state.state}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {formatPercentage(state.taxes.income_tax_rate, 2)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {formatPercentage(state.taxes.sales_tax_rate, 2)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
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
          <div className="mt-10 rounded-2xl border-l-4 border-[#e7b576] bg-[#fff8ed] p-7">
            <h3 className="mb-2 text-[18px] font-semibold text-slate-900">About Tax Rates</h3>
            <p className="text-[14px] text-slate-600">
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
