"use client";

import Navigation from "@/components/Navigation";
import StatisticsBot from "@/components/StatisticsBot";
import Link from "next/link";
import { useMemo } from "react";

export default function Home() {
  const usageMetrics = useMemo(
    () => [
      { value: "1,240+", label: "community updates shared" },
      { value: "86", label: "new updates this week" },
      { value: "410+", label: "people explored local views today" },
    ],
    [],
  );

  const recentActivity = useMemo(
    () => [
      "Someone shared an affordability update near Newark.",
      "Three new community updates were added this morning.",
      "Five people viewed housing trends near Phoenix recently.",
      "A neighbor compared tax and safety data near Raleigh.",
    ],
    [],
  );

  return (
    <>
      <Navigation />
      <main className="min-h-screen w-full bg-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Main Chatbot Box */}
          <div className="mb-14 rounded-2xl border border-[#d9e2d6] bg-white/90 p-8 shadow-[0_8px_26px_rgba(79,106,88,0.08)]">
            <StatisticsBot />
          </div>

          <section className="mb-10 rounded-2xl border border-[#d9e2d6] bg-[#fcfdf9] p-7 shadow-[0_6px_18px_rgba(79,106,88,0.07)]">
            <h2 className="mb-2 text-2xl font-semibold text-[#2f3d46]">What the community is doing</h2>
            <p className="mb-6 text-sm text-[#68767e]">
              People nearby are already using this space to share updates and explore local patterns together.
            </p>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              {usageMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-[#dde5db] bg-white px-4 py-3">
                  <p className="text-xl font-semibold text-[#3e645b]">{metric.value}</p>
                  <p className="text-sm text-[#6b7981]">{metric.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#dde5db] bg-white px-5 py-4">
              <h3 className="mb-3 text-base font-medium text-[#41565f]">Recent Activity</h3>
              <ul className="space-y-2 text-sm text-[#6b7981]">
                {recentActivity.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Navigation Cards to Charts */}
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-semibold text-[#2f3d46]">
              Jump Into Any View
            </h2>
            <p className="mb-8 max-w-3xl text-base text-[#66747c]">
              Pick a chart and start exploring. There is no fixed path, so you can move between views however you like.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/affordability-map"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Affordability Map
                </h3>
                <p className="text-sm text-[#66747c]">
                  See grocery affordability across the map and spot patterns quickly.
                </p>
              </Link>

              <Link
                href="/bar-chart"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  State Rankings
                </h3>
                <p className="text-sm text-[#66747c]">
                  Compare states side-by-side and sort by the metrics you care about.
                </p>
              </Link>

              <Link
                href="/monthly-annual"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Monthly vs Annual
                </h3>
                <p className="text-sm text-[#66747c]">
                  Explore how monthly spending lines up with annual totals.
                </p>
              </Link>

              <Link
                href="/food-insecurity"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Food Insecurity
                </h3>
                <p className="text-sm text-[#66747c]">
                  Check how affordability and food insecurity interact across states.
                </p>
              </Link>
            </div>
          </div>

          {/* New Content Cards */}
          <div>
            <h2 className="mb-2 text-3xl font-semibold text-[#2f3d46]">
              Everyday State Snapshots
            </h2>
            <p className="mb-8 max-w-3xl text-base text-[#66747c]">
              Browse taxes, housing, and lifestyle data in whichever order feels useful to you.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/state-profiles"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  State Profiles
                </h3>
                <p className="text-sm text-[#66747c]">
                  See a quick all-in-one summary for each state.
                </p>
              </Link>

              <Link
                href="/state-taxes"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Tax Rates by State
                </h3>
                <p className="text-sm text-[#66747c]">
                  Look at tax differences without digging through multiple sources.
                </p>
              </Link>

              <Link
                href="/state-income-housing"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Income & Housing
                </h3>
                <p className="text-sm text-[#66747c]">
                  Check how local income and home prices fit together.
                </p>
              </Link>

              <Link
                href="/state-safety-lifestyle"
                className="group rounded-2xl border border-[#dbe3d8] bg-[#fbfdf9] p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bb8a6] hover:shadow-[0_8px_18px_rgba(76,122,113,0.12)]"
              >
                <h3 className="mb-2 text-lg font-semibold text-[#2f3d46] group-hover:text-[#3f645c]">
                  Safety & Lifestyle
                </h3>
                <p className="text-sm text-[#66747c]">
                  Explore safety and day-to-day lifestyle signals in one place.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
