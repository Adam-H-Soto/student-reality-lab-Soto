"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
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
              Safety and Lifestyle at a Glance
            </h1>
            <p className="text-[18px] leading-7 text-slate-600">
              Compare safety, crime, and lifestyle trends across states in a quick, flexible view.
            </p>
            <p className="mt-2 text-sm text-[#76828a]">Community members use this page to stay aware of what is changing around them.</p>
          </div>

          {/* Sort Controls */}
          <div className="mb-10 rounded-2xl border border-[#d8e3d8] bg-white p-7 shadow-[0_6px_18px_rgba(95,143,160,0.08)]">
            <label className="text-[16px] font-semibold text-slate-900">
              Sort by:
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleSortClick("safety")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "safety"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Safest{getSortIndicator("safety")}
              </button>
              <button
                onClick={() => handleSortClick("crime")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "crime"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Crime Rate{getSortIndicator("crime")}
              </button>
              <button
                onClick={() => handleSortClick("nightlife")}
                className={`rounded-full px-4 py-2 font-medium transition-all ${
                  sortBy === "nightlife"
                    ? "bg-[#5f8fa0] text-white"
                    : "bg-[#edf4ee] text-[#445962] hover:bg-[#e2eee4]"
                }`}
              >
                Nightlife Score{getSortIndicator("nightlife")}
              </button>
            </div>
          </div>

          {/* Safety Table */}
          {loading ? (
            <div className="text-center text-[18px] text-slate-600">Loading state data...</div>
          ) : (
            <>
              <p className="mb-3 text-[14px] font-medium text-slate-600">
                Showing <span className="font-semibold text-slate-800">{sortBy === "safety" ? "Safety Index" : sortBy === "crime" ? "Crime Rate" : "Nightlife Score"}</span>,{" "}
                <span className="font-semibold text-slate-800">{sortDirection === "desc" ? "Descending" : "Ascending"}</span>
              </p>
              <div className="overflow-hidden rounded-2xl border border-[#d8e3d8] bg-white shadow-[0_6px_18px_rgba(95,143,160,0.08)]">
              <table className="w-full">
                <thead className="bg-[#6a8f80] text-white">
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
                      <td className="px-6 py-4 font-semibold text-slate-900">
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
                      <td className="px-6 py-4 text-center text-slate-600">
                        {state.lifestyle.crime_rate
                          ? `${state.lifestyle.crime_rate.toFixed(0)}/100k`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {formatScore(state.lifestyle.nightlife_score)}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-slate-600">
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
          <div className="mt-10 rounded-2xl border-l-4 border-[#e7b576] bg-[#fff8ed] p-7">
            <h3 className="mb-2 text-[18px] font-semibold text-slate-900">About These Metrics</h3>
            <p className="text-[14px] text-slate-600">
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
