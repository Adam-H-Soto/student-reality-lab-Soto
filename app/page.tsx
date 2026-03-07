"use client";

import { useEffect, useState } from "react";

import AffordabilityMap from "@/components/AffordabilityMap";
import BarChart from "@/components/BarChart";
import FoodInsecurityScatter from "@/components/FoodInsecurityScatter";
import MonthlyAnnualChart from "@/components/MonthlyAnnualChart";
import type { AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";

export default function Home() {
  const [rows, setRows] = useState<StateFoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapGroup, setMapGroup] = useState<AffordabilityGroup>("college-student");
  const [rankingGroup, setRankingGroup] = useState<AffordabilityGroup>("college-student");

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        const response = await fetch("/api/states", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as StateFoodData[];
        setRows(data);
        setError(null);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setError("Failed to load state data.");
        }
      } finally {
        setLoading(false);
      }
    }

    void run();
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-300 space-y-8 px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-[36px] font-bold leading-tight text-[#212121]">Student Reality Lab - Grocery Gap</h1>
      <p className="mb-6 max-w-4xl text-[16px] leading-6 text-[#757575]">
        Notice which states require the highest % of income for groceries and which states remain the least
        burdensome for each life stage.
      </p>

      {loading && <p className="text-[16px] text-[#757575]">Loading dashboard...</p>}
      {error && <p className="text-[16px] text-[#e53935]">{error}</p>}

      {!loading && !error && (
        <>
          <AffordabilityMap rows={rows} group={mapGroup} onGroupChange={setMapGroup} />
          <BarChart rows={rows} group={rankingGroup} onGroupChange={setRankingGroup} />
          <MonthlyAnnualChart rows={rows} group={mapGroup} />
          <FoodInsecurityScatter rows={rows} group={mapGroup} />
        </>
      )}
    </main>
  );
}
