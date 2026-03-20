"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import BarChart from "@/components/BarChart";
import type { AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";

export default function BarChartPage() {
  const [rows, setRows] = useState<StateFoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<AffordabilityGroup>("college-student");

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        const response = await fetch("/api/states?view=food", {
          signal: controller.signal,
          cache: "force-cache",
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as { data?: StateFoodData[] } | StateFoodData[];
        const rowsData = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
        setRows(rowsData);
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
    <>
      <Navigation />
      <main className="min-h-screen w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <h1 className="mb-2 text-[40px] font-bold text-[#212121]">
              📊 State Rankings
            </h1>
            <p className="text-[16px] leading-6 text-[#757575]">
              Compare states ranked by the percentage of income required for groceries. Choose a demographic group to see how different life stages are affected across the nation.
            </p>
          </div>

          {loading && <p className="text-[16px] text-[#757575]">Loading chart...</p>}
          {error && <p className="text-[16px] text-[#e53935]">{error}</p>}

          {!loading && !error && (
            <BarChart rows={rows} group={group} onGroupChange={setGroup} />
          )}
        </div>
      </main>
    </>
  );
}
