"use client";

import Navigation from "@/components/Navigation";
import StatisticsBot from "@/components/StatisticsBot";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen w-full bg-linear-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Main Chatbot Box */}
          <div className="mb-12 rounded-xl border-2 border-blue-200 bg-white p-8 shadow-lg">
            <StatisticsBot />
          </div>

          {/* Navigation Cards to Charts */}
          <div className="mb-8">
            <h2 className="mb-6 text-[28px] font-bold text-[#212121]">
              Explore Individual Charts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/affordability-map"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">🗺️</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Affordability Map
                </h3>
                <p className="text-[14px] text-[#757575]">
                  State-by-state grocery affordability visualization
                </p>
              </Link>

              <Link
                href="/bar-chart"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">📊</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  State Rankings
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Compare states by income required for groceries
                </p>
              </Link>

              <Link
                href="/monthly-annual"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">📈</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Monthly vs Annual
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Monthly and annual spending patterns
                </p>
              </Link>

              <Link
                href="/food-insecurity"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">📍</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Food Insecurity
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Scatter plot of food insecurity data
                </p>
              </Link>
            </div>
          </div>

          {/* New Content Cards */}
          <div>
            <h2 className="mb-6 text-[28px] font-bold text-[#212121]">
              Explore New State Data Content
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/state-profiles"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">🧾</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  State Profiles
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Browse comprehensive state snapshots in one place
                </p>
              </Link>

              <Link
                href="/state-taxes"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">💸</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Tax Rates by State
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Compare income, sales, and property tax levels
                </p>
              </Link>

              <Link
                href="/state-income-housing"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">🏠</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Income & Housing
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Evaluate earnings, home prices, and affordability
                </p>
              </Link>

              <Link
                href="/state-safety-lifestyle"
                className="group rounded-lg border-2 border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="mb-3 text-3xl">🌃</div>
                <h3 className="mb-2 text-[18px] font-bold text-[#212121] group-hover:text-blue-600">
                  Safety & Lifestyle
                </h3>
                <p className="text-[14px] text-[#757575]">
                  Explore safety index, crime rates, and nightlife
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
