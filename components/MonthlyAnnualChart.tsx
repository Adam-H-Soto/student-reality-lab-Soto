"use client";

import { useMemo, useRef, useState } from "react";

import { GROUP_LABELS, applyGroupAffordability, type AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";
import { getTooltipPlacement } from "@/lib/tooltip";

type ViewMode = "monthly" | "annual";

type TooltipState = {
  left: number;
  top: number;
  item: ReturnType<typeof applyGroupAffordability>[number];
  monthlyPercent: number;
  annualPercent: number;
} | null;

interface MonthlyAnnualChartProps {
  rows: StateFoodData[];
  group: AffordabilityGroup;
}

const WIDTH = 1200;
const HEIGHT = 470;
const MARGIN = { top: 28, right: 20, bottom: 125, left: 70 };
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 140;

export default function MonthlyAnnualChart({ rows, group }: MonthlyAnnualChartProps) {
  const [mode, setMode] = useState<ViewMode>("monthly");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => applyGroupAffordability(rows, group), [rows, group]);

  const normalized = useMemo(() => {
    return data.map((item) => {
      const monthlyPercent = item.group_monthly_ratio * 100;
      const annualPercent = item.group_annual_ratio * 100;

      return {
        item,
        monthlyPercent,
        annualPercent,
      };
    });
  }, [data]);

  const sorted = useMemo(() => {
    const key = mode === "monthly" ? "monthlyPercent" : "annualPercent";

    return [...normalized].sort((a, b) => {
      const diff = b[key] - a[key];
      if (Math.abs(diff) < 1e-9) {
        return b.item.state.localeCompare(a.item.state);
      }
      return diff;
    });
  }, [normalized, mode]);

  const extremes = useMemo(() => {
    if (normalized.length === 0) {
      return { lowestState: null as string | null, highestState: null as string | null };
    }

    const values = normalized.map((entry) => (mode === "monthly" ? entry.monthlyPercent : entry.annualPercent));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const lowestState = normalized
      .filter((entry) => Math.abs((mode === "monthly" ? entry.monthlyPercent : entry.annualPercent) - minValue) < 1e-9)
      .map((entry) => entry.item.state)
      .sort((a, b) => a.localeCompare(b))[0] ?? null;

    const highestState = normalized
      .filter((entry) => Math.abs((mode === "monthly" ? entry.monthlyPercent : entry.annualPercent) - maxValue) < 1e-9)
      .map((entry) => entry.item.state)
      .sort((a, b) => a.localeCompare(b))[0] ?? null;

    return {
      lowestState,
      highestState,
    };
  }, [normalized, mode]);

  const chart = useMemo(() => {
    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
    const maxMonthlyPercent = Math.max(0, ...normalized.map((d) => d.monthlyPercent));
    const maxAnnualPercent = Math.max(0, ...normalized.map((d) => d.annualPercent));
    const maxValue = Math.max(maxMonthlyPercent, maxAnnualPercent);
    const barWidth = sorted.length > 0 ? innerWidth / sorted.length : 0;

    return { innerWidth, innerHeight, maxValue, barWidth };
  }, [sorted, normalized]);

  function updateTooltip(
    event: React.MouseEvent<SVGRectElement, MouseEvent>,
    item: ReturnType<typeof applyGroupAffordability>[number],
    monthlyPercent: number,
    annualPercent: number,
  ) {
    const containerRect = chartContainerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return;
    }

    const placement = getTooltipPlacement({
      pointerClientX: event.clientX,
      pointerClientY: event.clientY,
      containerRect,
      tooltipWidth: TOOLTIP_WIDTH,
      tooltipHeight: TOOLTIP_HEIGHT,
    });

    setTooltip({ left: placement.left, top: placement.top, item, monthlyPercent, annualPercent });
  }

  if (rows.length === 0) {
    return <p className="text-[16px] text-[#757575]">Loading monthly vs annual chart...</p>;
  }

  return (
    <section className="material-card w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[26px] font-bold text-[#212121]">Monthly vs Annual Grocery Burden</h2>
        <div className="flex items-center gap-2 text-[16px] text-[#757575]">
          <button
            type="button"
            aria-label="Switch to monthly grocery burden view"
            className={`material-control px-3 py-1.5 ${mode === "monthly" ? "bg-[#3f51b5] text-white" : "bg-white text-[#212121]"}`}
            onClick={() => setMode("monthly")}
          >
            Monthly View
          </button>
          <button
            type="button"
            aria-label="Switch to annual grocery burden view"
            className={`material-control px-3 py-1.5 ${mode === "annual" ? "bg-[#3f51b5] text-white" : "bg-white text-[#212121]"}`}
            onClick={() => setMode("annual")}
          >
            Annual View
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#c5cae9] bg-[#eef1ff] p-3 text-[14px] text-[#212121]">
        <span className="font-bold">Dual highlight:</span> Highest burden state: {extremes.highestState ?? "N/A"};
        Lowest burden state: {extremes.lowestState ?? "N/A"}.
      </div>

      <div ref={chartContainerRef} className="relative w-full overflow-hidden rounded-md border border-[#d6d6d6] bg-white">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Bar chart comparing monthly and annual grocery burden by state"
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {sorted.map((entry, index) => {
              const value = mode === "monthly" ? entry.monthlyPercent : entry.annualPercent;
              const x = index * chart.barWidth;
              const h = chart.maxValue === 0 ? 0 : (value / chart.maxValue) * chart.innerHeight;
              const y = chart.innerHeight - h;
              const isHighest = entry.item.state === extremes.highestState;
              const isLowest = entry.item.state === extremes.lowestState;

              return (
                <g key={entry.item.state}>
                  <rect
                    x={x + 1}
                    y={y}
                    width={Math.max(chart.barWidth - 2, 1)}
                    height={h}
                    fill={isHighest ? "#e53935" : isLowest ? "#8bc34a" : "#536dfe"}
                    opacity={isHighest || isLowest ? 0.95 : 0.78}
                    onMouseMove={(event) => updateTooltip(event, entry.item, entry.monthlyPercent, entry.annualPercent)}
                    onMouseEnter={(event) => updateTooltip(event, entry.item, entry.monthlyPercent, entry.annualPercent)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {(index % 3 === 0 || index === sorted.length - 1) && entry.item.state !== "Mississippi" && (
                    <text
                      x={x + chart.barWidth / 2 + (entry.item.state === "Georgia" ? -10 : 0)}
                      y={chart.innerHeight + 20}
                      transform={`rotate(55 ${x + chart.barWidth / 2 + (entry.item.state === "Georgia" ? -10 : 0)} ${chart.innerHeight + 20})`}
                      textAnchor="start"
                      className="chart-label fill-[#757575]"
                    >
                      {entry.item.state}
                    </text>
                  )}
                </g>
              );
            })}

            <line x1={0} y1={chart.innerHeight} x2={chart.innerWidth} y2={chart.innerHeight} stroke="#bdbdbd" strokeWidth={1} />

            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const value = chart.maxValue * tick;
              const y = chart.innerHeight - chart.innerHeight * tick;
              return (
                <g key={tick}>
                  <line x1={0} y1={y} x2={chart.innerWidth} y2={y} stroke="#eeeeee" strokeWidth={1} />
                  <text x={-10} y={y + 4} textAnchor="end" className="chart-label fill-[#757575]">
                    {value.toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-30 w-[320px] rounded-md bg-[#212121] p-3 text-white shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            <p className="chart-label font-medium">{tooltip.item.state}</p>
            <p className="chart-label">Monthly grocery % ({GROUP_LABELS[group]}): {tooltip.monthlyPercent.toFixed(2)}%</p>
            <p className="chart-label">Annual grocery % ({GROUP_LABELS[group]}): {tooltip.annualPercent.toFixed(2)}%</p>
            <p className="chart-label">Median income: ${tooltip.item.median_income.toLocaleString()}</p>
            <p className="chart-label">Food insecurity: {tooltip.item.food_insecurity_rate.toFixed(1)}%</p>
          </div>
        )}
      </div>

      <div className="rounded-md bg-[#f5f5f5] p-4 text-[16px] leading-6 text-[#757575]">
        This view compares monthly and annual framing of grocery burden for the currently selected group, and it keeps
        both the highest and lowest burden states visibly marked for context. In practice, these two views should tell
        the same directional story, but showing both helps students translate between paycheck-level budgeting and
        annual planning language used in salary discussions. The dual highlights are especially important: the highest
        burden state represents a stress-test scenario where food costs consume a large share of income, while the
        lowest burden state gives a realistic floor for what affordability can look like. When switching from Young
        Adult to Recent Graduate and College Student, both bars move upward because the same grocery basket is divided
        by smaller effective income. That shift demonstrates how quickly affordability can change with life stage, even
        when prices stay fixed. For students, the practical takeaway is to evaluate states using both most- and
        least-affordable anchors, then estimate your own monthly risk before committing to a location.
      </div>
    </section>
  );
}
