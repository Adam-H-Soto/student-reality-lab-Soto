"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import type { UnifiedStateData } from "@/lib/schema";
import { formatScore, getSafetyColor } from "@/lib/formatData";

export default function StateSafetyPage() {
  const [states, setStates] = useState<UnifiedStateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"safety" | "crime" | "nightlife">("safety");
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
    switch (sortBy) {
      case "safety": {
        const safetyA = a.lifestyle.safety_index ?? 0;
        const safetyB = b.lifestyle.safety_index ?? 0;
        return sortDirection === "desc" ? safetyB - safetyA : safetyA - safetyB;
      }
      case "crime": {
        const crimeA = a.lifestyle.crime_rate ?? -1;
        const crimeB = b.lifestyle.crime_rate ?? -1;
        return sortDirection === "desc" ? crimeB - crimeA : crimeA - crimeB;
      }
      case "nightlife": {
        const nightA = a.lifestyle.nightlife_score ?? 0;
        const nightB = b.lifestyle.nightlife_score ?? 0;
        return sortDirection === "desc" ? nightB - nightA : nightA - nightB;
      }
      default:
        return 0;
    }
  });

  const handleSortClick = (field: "safety" | "crime" | "nightlife") => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }

    setSortBy(field);
    setSortDirection("desc");
  };

  const getSortIndicator = (field: "safety" | "crime" | "nightlife") => {
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
              Safety & Lifestyle
            </h1>
            <p className="text-[18px] leading-7 text-[#757575]">
              Compare safety indices, crime rates, and lifestyle amenities across all US states
            </p>
          </div>

          {/* Sort Controls */}
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-md">
            <label className="text-[16px] font-bold text-[#212121]">
              Sort by:
            </label>
            <div className="mt-3 flex gap-4">
              <button
                onClick={() => handleSortClick("safety")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "safety"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Safest{getSortIndicator("safety")}
              </button>
              <button
                onClick={() => handleSortClick("crime")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "crime"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Crime Rate{getSortIndicator("crime")}
              </button>
              <button
                onClick={() => handleSortClick("nightlife")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === "nightlife"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Nightlife Score{getSortIndicator("nightlife")}
              </button>
            </div>
          </div>

          {/* Safety Table */}
          {loading ? (
            <div className="text-center text-[18px] text-[#757575]">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-[#4b5563]">
                Sorting by <span className="font-bold text-[#1f2937]">{sortBy === "safety" ? "Safety Index" : sortBy === "crime" ? "Crime Rate" : "Nightlife Score"}</span>,{" "}
                <span className="font-bold text-[#1f2937]">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">State</th>
                    <th className="px-6 py-4 text-center font-bold">Safety Index</th>
                    <th className="px-6 py-4 text-center font-bold">Crime Rate</th>
                    <th className="px-6 py-4 text-center font-bold">Nightlife Score</th>
                    <th className="px-6 py-4 text-left font-bold">Top Industries</th>
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
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-block px-3 py-1 rounded-full font-bold text-white"
                          style={{ backgroundColor: getSafetyColor(state.lifestyle.safety_index) }}
                        >
                          {formatScore(state.lifestyle.safety_index)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {state.lifestyle.crime_rate
                          ? `${state.lifestyle.crime_rate.toFixed(0)}/100k`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center text-[#757575]">
                        {formatScore(state.lifestyle.nightlife_score)}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-[#757575]">
                        {state.lifestyle.top_industries.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="mt-8 rounded-lg bg-purple-50 p-6 border-l-4 border-purple-600">
            <h3 className="text-[18px] font-bold text-[#212121] mb-2">About These Metrics</h3>
            <p className="text-[14px] text-[#757575]">
              <strong>Safety Index:</strong> A normalized score (0-100) where higher values indicate safer communities.
              Calculated from crime data and public safety statistics. 
              <br /><br />
              <strong>Crime Rate:</strong> Reported crimes per 100,000 population from FBI Uniform Crime Reporting.
              <br /><br />
              <strong>Nightlife Score:</strong> A 0-100 rating based on density and quality of entertainment venues, restaurants, and cultural activities.
              <br /><br />
              <strong>Industries:</strong> Top employment sectors in each state based on Bureau of Labor Statistics data.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
