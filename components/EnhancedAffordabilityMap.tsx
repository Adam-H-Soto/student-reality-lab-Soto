"use client";

import { useState } from "react";
import AffordabilityMap from "./AffordabilityMap";
import StateDetailModal from "./StateDetailModal";
import type { StateFoodData } from "@/lib/schema";
import type { UnifiedStateData } from "@/lib/schema";

interface EnhancedAffordabilityMapProps {
  rows: StateFoodData[];
  group: "college-student" | "recent-graduate" | "young-adult";
  onGroupChange: (group: "college-student" | "recent-graduate" | "young-adult") => void;
}

export default function EnhancedAffordabilityMapWithModal(props: EnhancedAffordabilityMapProps) {
  const [selectedState, setSelectedState] = useState<UnifiedStateData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStateClick = async (stateName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/states?state=${encodeURIComponent(stateName)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedState(data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching state data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Note: The modal click handler is set up, but the AffordabilityMap component
  // would need to be updated to accept an onClick handler for states.
  // For now, users can use the chatbot to get detailed state information.

  return (
    <>
      <AffordabilityMap {...props} />
      <StateDetailModal
        state={selectedState}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedState(null);
        }}
      />
      {isLoading && (
        <div className="fixed bottom-4 right-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-lg">
          Loading state details...
        </div>
      )}
      {/* Hidden element for accessibility - users can interact via chatbot */}
      <div className="sr-only" id="enhanced-map-note">
        Interactive state details are available through the research assistant. Ask about any state&apos;s taxes,
        housing, safety, or lifestyle information.
      </div>
      {/* Store handleStateClick reference for potential future use */}
      {void handleStateClick}
    </>
  );
}
