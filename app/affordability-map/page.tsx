"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import AffordabilityMap from "@/components/AffordabilityMap";
import Link from "next/link";
import type { AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";

export default function AffordabilityMapPage() {
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
          setError("We could not load state data right now.");
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
      <main className="min-h-screen w-full bg-transparent">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex rounded-full border border-[#d6e0d2] bg-white px-4 py-2 text-sm text-[#4b5f68] transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            ← Back to Home
          </Link>
          <div className="mb-10 max-w-3xl">
            <h1 className="mb-2 text-[40px] font-semibold text-slate-900">
              Affordability Map
            </h1>
            <p className="text-[16px] leading-6 text-slate-600">
              Take a look around the map and compare states at your own pace. You can switch demographic groups any time.
            </p>
            <p className="mt-2 text-sm text-[#76828a]">People like you are already exploring nearby trends in this view.</p>
          </div>

          {loading && <p className="text-[16px] text-slate-600">Loading map data...</p>}
          {error && <p className="text-[16px] text-red-700">No one has shared updates here yet in this session. You can refresh and try again.</p>}

          {!loading && !error && (
            <AffordabilityMap rows={rows} group={group} onGroupChange={setGroup} />
          )}
        </div>
      </main>
    </>
  );
}
