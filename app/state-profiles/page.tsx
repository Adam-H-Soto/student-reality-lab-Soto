"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import StateDetailModal from "@/components/StateDetailModal";
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
      <main className="min-h-screen w-full bg-linear-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-[48px] font-bold text-[#212121]">
              State Profiles
            </h1>
            <p className="text-[18px] leading-7 text-[#757575]">
              View comprehensive information for all 50 US states
            </p>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search states by name or code (e.g., CA, Texas)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3 rounded-lg border-2 border-blue-300 focus:border-blue-600 focus:outline-none text-[16px]"
            />
          </div>

          {/* States Grid */}
          {loading ? (
            <div className="text-center text-[18px] text-[#757575]">Loading state data...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStates.map((state) => (
                <div
                  key={state.state}
                  onClick={() => handleStateClick(state)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[24px] font-bold text-[#212121]">
                        {state.state}
                      </h3>
                      <p className="text-[14px] text-gray-500">{state.state_code}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-3 text-[14px]">
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Income Tax:</span>
                      <span className="font-semibold text-[#212121]">
                        {state.taxes.income_tax_rate !== null 
                          ? `${state.taxes.income_tax_rate.toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Median Income:</span>
                      <span className="font-semibold text-[#212121]">
                        ${(state.income.median_household_income / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Safety:</span>
                      <span className="font-semibold text-[#212121]">
                        {state.lifestyle.safety_index !== null
                          ? `${state.lifestyle.safety_index.toFixed(1)}/100`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Food Insecurity:</span>
                      <span className="font-semibold text-[#212121]">
                        {state.food_insecurity_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Click to View Button */}
                  <button className="w-full mt-6 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredStates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[18px] text-[#757575]">
                 No states found matching &quot;{searchTerm}&quot;
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
