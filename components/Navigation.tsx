"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [chartsOpen, setChartsOpen] = useState(false);
  const [stateLibraryOpen, setStateLibraryOpen] = useState(false);

  return (
    <nav className="border-b border-[#d8dfd4] bg-[#f8f8f3] text-[#31424b]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex flex-col space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight text-[#2f3d46]">YourNextMove</h2>
            <p className="text-xs text-[#6b777f]">Explore state affordability and lifestyle data your way</p>
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/"
              className="text-[#40535e] transition-colors hover:text-[#2f3d46]"
            >
              Home
            </Link>
            <div className="relative">
              <button
                onClick={() => setChartsOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-[#40535e] transition-colors hover:text-[#2f3d46]"
                aria-expanded={chartsOpen}
                aria-haspopup="menu"
              >
                Charts
                <svg
                  className={`h-4 w-4 transition-transform ${chartsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {chartsOpen && (
                <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-[#d5ddd2] bg-white shadow-lg">
                  <Link
                    href="/affordability-map"
                    className="block rounded-t-xl px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setChartsOpen(false)}
                  >
                    Affordability Map
                  </Link>
                  <Link
                    href="/bar-chart"
                    className="block px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setChartsOpen(false)}
                  >
                    State Rankings
                  </Link>
                  <Link
                    href="/monthly-annual"
                    className="block px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setChartsOpen(false)}
                  >
                    Monthly vs Annual
                  </Link>
                  <Link
                    href="/food-insecurity"
                    className="block rounded-b-xl px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setChartsOpen(false)}
                  >
                    Food Insecurity
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setStateLibraryOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-[#40535e] transition-colors hover:text-[#2f3d46]"
                aria-expanded={stateLibraryOpen}
                aria-haspopup="menu"
              >
                State Library
                <svg
                  className={`h-4 w-4 transition-transform ${stateLibraryOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {stateLibraryOpen && (
                <div className="absolute left-0 z-50 mt-2 w-60 rounded-xl border border-[#d5ddd2] bg-white shadow-lg">
                  <Link
                    href="/state-profiles"
                    className="block rounded-t-xl px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setStateLibraryOpen(false)}
                  >
                    State Profiles
                  </Link>
                  <Link
                    href="/state-taxes"
                    className="block px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setStateLibraryOpen(false)}
                  >
                    Tax Rates by State
                  </Link>
                  <Link
                    href="/state-income-housing"
                    className="block px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setStateLibraryOpen(false)}
                  >
                    Income & Housing
                  </Link>
                  <Link
                    href="/state-safety-lifestyle"
                    className="block rounded-b-xl px-4 py-3 text-sm text-[#40535e] hover:bg-[#f2f7f1]"
                    onClick={() => setStateLibraryOpen(false)}
                  >
                    Safety & Lifestyle
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
