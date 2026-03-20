"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-[#212121] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="flex flex-col space-y-0.5">
            <h2 className="text-xl font-bold">YourNextMove</h2>
            <p className="text-xs text-gray-300">Food affordability & lifestyle data across the US</p>
          </Link>
          <div className="flex space-x-6 items-center">
            <Link
              href="/"
              className="hover:text-blue-400 transition-colors"
            >
              AI Chatbot
            </Link>
            <Link
              href="/affordability-map"
              className="hover:text-blue-400 transition-colors"
            >
              Affordability Map
            </Link>
            <Link
              href="/bar-chart"
              className="hover:text-blue-400 transition-colors"
            >
              State Rankings
            </Link>
            <Link
              href="/monthly-annual"
              className="hover:text-blue-400 transition-colors"
            >
              Monthly vs Annual
            </Link>
            <Link
              href="/food-insecurity"
              className="hover:text-blue-400 transition-colors"
            >
              Food Insecurity
            </Link>

            {/* State Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hover:text-blue-400 transition-colors flex items-center gap-2 py-2"
              >
                State Data
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-lg shadow-lg z-50 border border-gray-700">
                  <Link
                    href="/state-profiles"
                    className="block px-4 py-3 hover:bg-blue-600 transition-colors rounded-t-lg"
                    onClick={() => setDropdownOpen(false)}
                  >
                    All State Profiles
                  </Link>
                  <Link
                    href="/state-taxes"
                    className="block px-4 py-3 hover:bg-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Tax Rates by State
                  </Link>
                  <Link
                    href="/state-income-housing"
                    className="block px-4 py-3 hover:bg-blue-600 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Income & Housing
                  </Link>
                  <Link
                    href="/state-safety-lifestyle"
                    className="block px-4 py-3 hover:bg-blue-600 transition-colors rounded-b-lg"
                    onClick={() => setDropdownOpen(false)}
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
