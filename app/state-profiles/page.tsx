"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import StateDetailModal from "@/components/StateDetailModal";
import Link from "next/link";
import type { UnifiedStateData } from "@/lib/schema";

export default function StateProfilesPage() {
  const [states, setStates] = useState<UnifiedStateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<UnifiedStateData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredStates = states.filter(state =>
    state.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.state_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStateClick = (state: UnifiedStateData) => {
    setSelectedState(state);
    setIsModalOpen(true);
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
              Explore State Profiles
            </h1>
            <p className="text-[18px] leading-7 text-slate-600">
              Browse any state and open details whenever you want. Nothing is locked behind a fixed sequence.
            </p>
            <p className="mt-2 text-sm text-[#76828a]">Users like you are helping build a clearer picture of what each area looks like.</p>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Try a state name or code, like Texas or CA"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#cfdccf] bg-white px-6 py-3 text-[16px] text-[#2f3d46] focus:border-[#5f8fa0] focus:outline-none"
            />
            <p className="mt-2 text-sm text-[#6f7d84]">People nearby use this to stay informed. You can search by full name or two-letter code.</p>
          </div>

          {/* States Grid */}
          {loading ? (
            <div className="text-center text-[18px] text-slate-600">Loading state data...</div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredStates.map((state) => (
                <div
                  key={state.state}
                  onClick={() => handleStateClick(state)}
                  className="cursor-pointer rounded-2xl border border-[#d8e3d8] bg-white p-7 shadow-[0_6px_18px_rgba(95,143,160,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#9ab9a6]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[24px] font-semibold text-slate-900">
                        {state.state}
                      </h3>
                      <p className="text-[14px] text-slate-500">{state.state_code}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-3 text-[14px]">
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-slate-600">Income Tax:</span>
                      <span className="font-semibold text-slate-900">
                        {state.taxes.income_tax_rate !== null 
                          ? `${state.taxes.income_tax_rate.toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-slate-600">Median Income:</span>
                      <span className="font-semibold text-slate-900">
                        ${(state.income.median_household_income / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-slate-600">Safety:</span>
                      <span className="font-semibold text-slate-900">
                        {state.lifestyle.safety_index !== null
                          ? `${state.lifestyle.safety_index.toFixed(1)}/100`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Food Insecurity:</span>
                      <span className="font-semibold text-slate-900">
                        {state.food_insecurity_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Click to View Button */}
                  <button className="mt-7 w-full rounded-xl bg-[#5f8fa0] py-2 font-medium text-white transition-colors hover:bg-[#537f8f]">
                    See What Others Shared
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredStates.length === 0 && (
            <div className="text-center py-12">
                <p className="text-[18px] text-slate-600">
                  No one has shared anything with that search yet. Try another state name, or be the first to explore this area.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <StateDetailModal
        state={selectedState}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedState(null);
        }}
      />
    </>
  );
}
