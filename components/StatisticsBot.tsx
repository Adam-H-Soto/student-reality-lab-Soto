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
        "Hi! I can help you explore state data on affordability, food insecurity, taxes, housing, and lifestyle. Ask about any state, compare a few, or choose a visual and we can dig in together.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodRows, setFoodRows] = useState<StateFoodData[]>([]);
  const [unifiedStates, setUnifiedStates] = useState<UnifiedStateData[]>([]);
  const [visualsLoading, setVisualsLoading] = useState(true);
  const [activeVisual, setActiveVisual] = useState<VisualSection>("none");
  const [showNoVisualHint, setShowNoVisualHint] = useState(true);
  const [group, setGroup] = useState<AffordabilityGroup>("college-student");
  const [communityConfirmation, setCommunityConfirmation] = useState<string | null>(null);
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
    setCommunityConfirmation("Thanks for sharing. Your question helps others explore this data too.");
    setTimeout(() => setCommunityConfirmation(null), 5000);
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
          content: "That did not go through. Could you check it and try again? I am here when you are ready.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualToggle = (visual: SelectableVisualSection) => {
    setActiveVisual((prev) => (prev === visual ? "none" : visual));
  };

  const shouldShowVisualPanel =
    visualsLoading || activeVisual !== "none" || showNoVisualHint;

  return (
    <div className="flex h-[78vh] min-h-176 flex-col rounded-2xl border border-[#d8e2d6] bg-[#f8fbf5]">
        {/* Chat Header */}
        <div className="rounded-t-2xl border-b border-[#d8e2d6] bg-[#eaf3e8] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#2f3d46]">Chat Assistant</h3>
          <p className="text-sm text-[#60717b]">Ask whatever feels useful, then switch views when you want a different angle.</p>
        </div>

        {/* Visual Selector (always visible) */}
        <div className="border-b border-[#d8e2d6] bg-white px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleVisualToggle("map")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "map" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Map
            </button>
            <button
              onClick={() => handleVisualToggle("bar")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "bar" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Rankings Chart
            </button>
            <button
              onClick={() => handleVisualToggle("monthly")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "monthly" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Monthly vs Annual
            </button>
            <button
              onClick={() => handleVisualToggle("scatter")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "scatter" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Food Insecurity Scatter
            </button>
            <button
              onClick={() => handleVisualToggle("tax-cards")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "tax-cards" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Tax Cards
            </button>
            <button
              onClick={() => handleVisualToggle("income-housing-cards")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "income-housing-cards" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Income & Housing Cards
            </button>
            <button
              onClick={() => handleVisualToggle("safety-cards")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "safety-cards" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              Safety Cards
            </button>
            <button
              onClick={() => handleVisualToggle("state-profiles")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${activeVisual === "state-profiles" ? "border-[#5f8fa0] bg-[#5f8fa0] text-white" : "border-[#d8e2d6] bg-[#f4f8f2] text-[#4a5f69]"}`}
            >
              State Profile Cards
            </button>
            <button
              onClick={() => {
                setActiveVisual("none");
                setShowNoVisualHint(false);
              }}
              className="rounded-full border border-[#d8e2d6] bg-[#f4f8f2] px-3 py-1.5 text-sm font-medium text-[#4a5f69] hover:bg-[#eaf3e8]"
            >
              Clear View
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-[#6a8f80] text-white"
                    : "border border-[#d8e2d6] bg-white text-[#30404a]"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-[#d8e2d6] bg-white px-4 py-2 text-sm text-[#60717b]">
                Thinking this through...
              </div>
            </div>
          )}

          {shouldShowVisualPanel && (
          <div className="mt-4 rounded-xl border border-[#d8e2d6] bg-white p-4">

            {visualsLoading && <p className="text-sm text-[#60717b]">Loading visual data...</p>}
            {!visualsLoading && activeVisual === "none" && showNoVisualHint && (
              <p className="text-sm text-[#60717b]">
                No one has opened a visual in this chat yet. You can be the first and pick any view.
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
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">Tax Summary (Top 5 by Rate)</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Income Tax</p>
                    {topTaxStates.withIncomeTax.map((state) => (
                      <p key={`income-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatPercentage(state.taxes.income_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Sales Tax</p>
                    {topTaxStates.withSalesTax.map((state) => (
                      <p key={`sales-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatPercentage(state.taxes.sales_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Property Tax</p>
                    {topTaxStates.withPropertyTax.map((state) => (
                      <p key={`property-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatPercentage(state.taxes.property_tax_rate, 2)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "income-housing-cards" && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">Income and Housing Summary</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Highest Median Income</p>
                    {topIncomeHousing.highestIncome.map((state) => (
                      <p key={`income-rank-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatCurrency(state.income.median_household_income)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Highest Home Prices</p>
                    {topIncomeHousing.highestHousing.map((state) => (
                      <p key={`housing-rank-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatCurrency(state.housing.median_home_price)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "safety-cards" && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">Safety and Lifestyle Summary</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Safest States</p>
                    {topSafetyLifestyle.safest.map((state) => (
                      <p key={`safe-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {formatScore(state.lifestyle.safety_index)}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Highest Crime Rate</p>
                    {topSafetyLifestyle.highestCrime.map((state) => (
                      <p key={`crime-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: {state.lifestyle.crime_rate?.toFixed(0) ?? "N/A"}/100k
                      </p>
                    ))}
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-3">
                    <p className="mb-2 font-semibold text-slate-900">Best Nightlife</p>
                    {topSafetyLifestyle.bestNightlife.map((state) => (
                      <p key={`nightlife-${state.state}`} className="text-sm text-slate-700">
                        {state.state}: <span style={{ color: getSafetyColor(state.lifestyle.nightlife_score) }}>{formatScore(state.lifestyle.nightlife_score)}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!visualsLoading && activeVisual === "state-profiles" && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">State Profile Cards</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stateProfiles.map((state) => (
                    <div key={state.state} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                      <p className="text-base font-semibold text-slate-900">{state.state}</p>
                      <p className="text-sm text-slate-700">Income: {formatCurrency(state.income.median_household_income)}</p>
                      <p className="text-sm text-slate-700">Home Price: {formatCurrency(state.housing.median_home_price)}</p>
                      <p className="text-sm text-slate-700">Safety: {formatScore(state.lifestyle.safety_index)}</p>
                      <p className="text-sm text-slate-700">Food Insecurity: {formatPercentage(state.food_insecurity_rate, 1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="rounded-b-2xl border-t border-[#d8e2d6] bg-white px-6 py-4"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share a question (example: compare Texas and Colorado for housing and taxes)."
              disabled={loading}
              className="flex-1 rounded-xl border border-[#d0ddd0] px-4 py-2 text-sm text-[#2f3d46] focus:border-[#5f8fa0] focus:outline-none disabled:bg-[#f0f4ed]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#5f8fa0] px-6 py-2 font-medium text-white transition-colors hover:bg-[#537f8f] disabled:bg-[#b7c8c1]"
            >
              Share
            </button>
          </div>
          <p className="mt-2 text-xs text-[#7a868d]">People in your area are using this space to stay informed together.</p>
          {communityConfirmation && (
            <p className="mt-2 text-sm text-[#4d766e]">{communityConfirmation}</p>
          )}
        </form>
      </div>
  );
}

