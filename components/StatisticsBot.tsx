"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AffordabilityMap from "@/components/AffordabilityMap";
import BarChart from "@/components/BarChart";
import FoodInsecurityScatter from "@/components/FoodInsecurityScatter";
import MonthlyAnnualChart from "@/components/MonthlyAnnualChart";
import type { AffordabilityGroup } from "@/lib/affordability";
import { formatCurrency, formatPercentage, formatScore, getSafetyColor } from "@/lib/formatData";
import type { StateFoodData, UnifiedStateData } from "@/lib/schema";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function hasRequiredStateData(
  state: UnifiedStateData | null | undefined,
): state is UnifiedStateData {
  return Boolean(
    state &&
      state.taxes &&
      state.income &&
      state.housing &&
      state.lifestyle,
  );
}

type VisualSection =
  | "none"
  | "map"
  | "bar"
  | "monthly"
  | "scatter"
  | "tax-cards"
  | "income-housing-cards"
  | "safety-cards"
  | "state-profiles";

type SelectableVisualSection = Exclude<VisualSection, "none">;

function inferVisualSectionFromPrompt(prompt: string): VisualSection {
  const q = prompt.toLowerCase();

  if (q.includes("map") || q.includes("geographic")) return "map";
  if (q.includes("bar") || q.includes("ranking") || q.includes("rank")) return "bar";
  if (q.includes("monthly") || q.includes("annual") || q.includes("yearly")) return "monthly";
  if (q.includes("scatter") || q.includes("food insecurity")) return "scatter";
  if (q.includes("tax") || q.includes("property tax") || q.includes("sales tax")) return "tax-cards";
  if (q.includes("income") || q.includes("housing") || q.includes("home price")) return "income-housing-cards";
  if (q.includes("safety") || q.includes("crime") || q.includes("nightlife") || q.includes("lifestyle")) {
    return "safety-cards";
  }
  if (q.includes("card") || q.includes("profile")) return "state-profiles";

  return "none";
}

export default function StatisticsBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to YourNextMove! I'm your AI assistant for comprehensive lifestyle and affordability insights across the US. I can help you explore grocery affordability, food insecurity patterns, state taxes, income and housing costs, safety metrics, and more. Try asking about specific states, comparing regions, or finding data visualizations that match your interests!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodRows, setFoodRows] = useState<StateFoodData[]>([]);
  const [unifiedStates, setUnifiedStates] = useState<UnifiedStateData[]>([]);
  const [visualsLoading, setVisualsLoading] = useState(true);
  const [activeVisual, setActiveVisual] = useState<VisualSection>("none");
  const [group, setGroup] = useState<AffordabilityGroup>("college-student");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the messages container to the bottom, not the page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVisualData() {
      try {
        setVisualsLoading(true);

        const [foodResponse, unifiedResponse] = await Promise.all([
          fetch("/api/states?view=food", { signal: controller.signal, cache: "force-cache" }),
          fetch("/api/states", { signal: controller.signal, cache: "force-cache" }),
        ]);

        if (!foodResponse.ok || !unifiedResponse.ok) {
          throw new Error("Failed to load chatbot visualization data");
        }

        const foodPayload = (await foodResponse.json()) as StateFoodData[];
        const unifiedPayload = (await unifiedResponse.json()) as { data?: UnifiedStateData[] } | UnifiedStateData[];
        const statesData = Array.isArray(unifiedPayload)
          ? unifiedPayload
          : Array.isArray(unifiedPayload.data)
            ? unifiedPayload.data
            : [];

        setFoodRows(Array.isArray(foodPayload) ? foodPayload : []);
        setUnifiedStates(statesData.filter(hasRequiredStateData));
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          console.error("Failed to load chatbot visual data", error);
        }
      } finally {
        setVisualsLoading(false);
      }
    }

    void loadVisualData();
    return () => controller.abort();
  }, []);

  const stateProfiles = useMemo(() => {
    return [...unifiedStates].sort((a, b) => a.state.localeCompare(b.state));
  }, [unifiedStates]);

  const topTaxStates = useMemo(() => {
    const withIncomeTax = unifiedStates
      .filter((s) => s.taxes.income_tax_rate !== null)
      .sort((a, b) => (b.taxes.income_tax_rate ?? 0) - (a.taxes.income_tax_rate ?? 0))
      .slice(0, 5);

    const withSalesTax = unifiedStates
      .filter((s) => s.taxes.sales_tax_rate !== null)
      .sort((a, b) => (b.taxes.sales_tax_rate ?? 0) - (a.taxes.sales_tax_rate ?? 0))
      .slice(0, 5);

    const withPropertyTax = unifiedStates
      .filter((s) => s.taxes.property_tax_rate !== null)
      .sort((a, b) => (b.taxes.property_tax_rate ?? 0) - (a.taxes.property_tax_rate ?? 0))
      .slice(0, 5);

    return { withIncomeTax, withSalesTax, withPropertyTax };
  }, [unifiedStates]);

  const topIncomeHousing = useMemo(() => {
    const highestIncome = [...unifiedStates]
      .sort((a, b) => b.income.median_household_income - a.income.median_household_income)
      .slice(0, 5);

    const highestHousing = [...unifiedStates]
      .filter((s) => s.housing.median_home_price !== null)
      .sort((a, b) => (b.housing.median_home_price ?? 0) - (a.housing.median_home_price ?? 0))
      .slice(0, 5);

    return { highestIncome, highestHousing };
  }, [unifiedStates]);

  const topSafetyLifestyle = useMemo(() => {
    const safest = [...unifiedStates]
      .filter((s) => s.lifestyle.safety_index !== null)
      .sort((a, b) => (b.lifestyle.safety_index ?? 0) - (a.lifestyle.safety_index ?? 0))
      .slice(0, 5);

    const highestCrime = [...unifiedStates]
      .filter((s) => s.lifestyle.crime_rate !== null)
      .sort((a, b) => (b.lifestyle.crime_rate ?? 0) - (a.lifestyle.crime_rate ?? 0))
      .slice(0, 5);

    const bestNightlife = [...unifiedStates]
      .filter((s) => s.lifestyle.nightlife_score !== null)
      .sort((a, b) => (b.lifestyle.nightlife_score ?? 0) - (a.lifestyle.nightlife_score ?? 0))
      .slice(0, 5);

    return { safest, highestCrime, bestNightlife };
  }, [unifiedStates]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const inferredVisual = inferVisualSectionFromPrompt(userMessage);
    if (inferredVisual !== "none") {
      setActiveVisual(inferredVisual);
    }

    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== "assistant" || m.content),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const data = (await response.json()) as { message?: string };
      const assistantMessage = data.message || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualToggle = (visual: SelectableVisualSection) => {
    setActiveVisual((prev) => (prev === visual ? "none" : visual));
  };

  return (
    <div className="flex h-[78vh] min-h-175 flex-col rounded-lg bg-gray-50">
        {/* Chat Header */}
        <div className="border-b border-gray-200 bg-blue-600 px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">AI Statistics Assistant</h3>
          <p className="text-sm text-blue-100">Ask questions or request map/chart/card views</p>
        </div>

        {/* Visual Selector (always visible) */}
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleVisualToggle("map")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "map" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Map
            </button>
            <button
              onClick={() => handleVisualToggle("bar")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "bar" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Rankings Chart
            </button>
            <button
              onClick={() => handleVisualToggle("monthly")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "monthly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Monthly vs Annual
            </button>
            <button
              onClick={() => handleVisualToggle("scatter")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "scatter" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Food Insecurity Scatter
            </button>
            <button
              onClick={() => handleVisualToggle("tax-cards")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "tax-cards" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Tax Cards
            </button>
            <button
              onClick={() => handleVisualToggle("income-housing-cards")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "income-housing-cards" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Income & Housing Cards
            </button>
            <button
              onClick={() => handleVisualToggle("safety-cards")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "safety-cards" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              Safety Cards
            </button>
            <button
              onClick={() => handleVisualToggle("state-profiles")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${activeVisual === "state-profiles" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              State Profile Cards
            </button>
            <button
              onClick={() => setActiveVisual("none")}
              className="rounded-md px-3 py-1.5 text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Hide Visual
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-white border border-gray-200 px-4 py-2">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">

            {visualsLoading && <p className="text-sm text-gray-600">Loading visual data...</p>}
            {!visualsLoading && activeVisual === "none" && (
              <p className="text-sm text-gray-600">
                Ask for a map, chart, or cards in chat and the selected visual will render right here in this same chat window.
              </p>
            )}

            {!visualsLoading && activeVisual === "map" && (
              <div className="mb-6">
                <AffordabilityMap rows={foodRows} group={group} onGroupChange={setGroup} />
              </div>
            )}

            {!visualsLoading && activeVisual === "bar" && (
              <div className="mb-6">
                <BarChart rows={foodRows} group={group} onGroupChange={setGroup} />
              </div>
            )}

            {!visualsLoading && activeVisual === "monthly" && (
              <div className="mb-6">
                <MonthlyAnnualChart rows={foodRows} group={group} onGroupChange={setGroup} />
              </div>
            )}

            {!visualsLoading && activeVisual === "scatter" && (
              <div className="mb-6">
                <FoodInsecurityScatter rows={foodRows} group={group} onGroupChange={setGroup} />
              </div>
            )}

            {!visualsLoading && activeVisual === "tax-cards" && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-lg font-bold text-gray-900">Tax Cards (Top 5 by Rate)</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Income Tax</p>
                    {topTaxStates.withIncomeTax.map((state) => (
                      <p key={`income-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatPercentage(state.taxes.income_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Sales Tax</p>
                    {topTaxStates.withSalesTax.map((state) => (
                      <p key={`sales-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatPercentage(state.taxes.sales_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Property Tax</p>
                    {topTaxStates.withPropertyTax.map((state) => (
                      <p key={`property-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatPercentage(state.taxes.property_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "income-housing-cards" && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-lg font-bold text-gray-900">Income & Housing Cards</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Highest Median Income</p>
                    {topIncomeHousing.highestIncome.map((state) => (
                      <p key={`income-rank-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatCurrency(state.income.median_household_income)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Highest Home Prices</p>
                    {topIncomeHousing.highestHousing.map((state) => (
                      <p key={`housing-rank-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatCurrency(state.housing.median_home_price)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "safety-cards" && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-lg font-bold text-gray-900">Safety & Lifestyle Cards</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Safest States</p>
                    {topSafetyLifestyle.safest.map((state) => (
                      <p key={`safe-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {formatScore(state.lifestyle.safety_index)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Highest Crime Rate</p>
                    {topSafetyLifestyle.highestCrime.map((state) => (
                      <p key={`crime-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: {state.lifestyle.crime_rate?.toFixed(0) ?? "N/A"}/100k
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="mb-2 font-semibold text-gray-900">Best Nightlife</p>
                    {topSafetyLifestyle.bestNightlife.map((state) => (
                      <p key={`nightlife-${state.state}`} className="text-sm text-gray-700">
                        {state.state}: <span style={{ color: getSafetyColor(state.lifestyle.nightlife_score) }}>{formatScore(state.lifestyle.nightlife_score)}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "state-profiles" && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-lg font-bold text-gray-900">State Profile Cards</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stateProfiles.map((state) => (
                    <div key={state.state} className="rounded-md bg-white p-3 shadow-sm">
                      <p className="text-base font-bold text-gray-900">{state.state}</p>
                      <p className="text-sm text-gray-700">Income: {formatCurrency(state.income.median_household_income)}</p>
                      <p className="text-sm text-gray-700">Home Price: {formatCurrency(state.housing.median_home_price)}</p>
                      <p className="text-sm text-gray-700">Safety: {formatScore(state.lifestyle.safety_index)}</p>
                      <p className="text-sm text-gray-700">Food Insecurity: {formatPercentage(state.food_insecurity_rate, 1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the statistics or type: show map, rankings, tax cards..."
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
  );
}

