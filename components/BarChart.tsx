"use client";

import { useMemo, useRef, useState } from "react";

import { GROUP_LABELS, applyGroupAffordability, type AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";
import { getTooltipPlacement } from "@/lib/tooltip";

type SortOrder = "desc" | "asc";

type TooltipState = {
  left: number;
  top: number;
  item: ReturnType<typeof applyGroupAffordability>[number];
} | null;

interface BarChartProps {
  rows: StateFoodData[];
  group: AffordabilityGroup;
  onGroupChange: (group: AffordabilityGroup) => void;
}

const WIDTH = 1200;
const HEIGHT = 460;
const MARGIN = { top: 28, right: 20, bottom: 130, left: 70 };
const TOOLTIP_WIDTH = 292;
const TOOLTIP_HEIGHT = 120;

const GROUP_COLOR_RANGES: Record<AffordabilityGroup, { start: string; end: string; label: string }> = {
  "college-student": {
    start: "#8bc34a",
    end: "#e53935",
    label: "Green to red",
  },
  "recent-graduate": {
    start: "#ffffff",
    end: "#111111",
    label: "White to black",
  },
  "young-adult": {
    start: "#dbeafe",
    end: "#7e22ce",
    label: "Light blue to purple",
  },
};

function interpolateHex(start: string, end: string, t: number): string {
  const clampT = Math.max(0, Math.min(1, t));
  const startInt = Number.parseInt(start.slice(1), 16);
  const endInt = Number.parseInt(end.slice(1), 16);

  const sr = (startInt >> 16) & 0xff;
  const sg = (startInt >> 8) & 0xff;
  const sb = startInt & 0xff;

  const er = (endInt >> 16) & 0xff;
  const eg = (endInt >> 8) & 0xff;
  const eb = endInt & 0xff;

  const r = Math.round(sr + (er - sr) * clampT);
  const g = Math.round(sg + (eg - sg) * clampT);
  const b = Math.round(sb + (eb - sb) * clampT);

  return `rgb(${r}, ${g}, ${b})`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BarChart({ rows, group, onGroupChange }: BarChartProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => applyGroupAffordability(rows, group), [rows, group]);

  const sortedRows = useMemo(() => {
    const next = [...data].sort((a, b) => a.group_grocery_income_ratio - b.group_grocery_income_ratio);
    return sortOrder === "desc" ? next.reverse() : next;
  }, [data, sortOrder]);

  const extremes = useMemo(() => {
    if (data.length === 0) {
      return {
        lowestState: null as string | null,
        highestState: null as string | null,
      };
    }

    const ratios = data.map((entry) => entry.group_grocery_income_ratio);
    const minRatio = Math.min(...ratios);
    const maxRatio = Math.max(...ratios);

    const lowestState = data
      .filter((entry) => Math.abs(entry.group_grocery_income_ratio - minRatio) < 1e-9)
      .map((entry) => entry.state)
      .sort((a, b) => a.localeCompare(b))[0] ?? null;

    const highestState = data
      .filter((entry) => Math.abs(entry.group_grocery_income_ratio - maxRatio) < 1e-9)
      .map((entry) => entry.state)
      .sort((a, b) => a.localeCompare(b))[0] ?? null;

    return {
      lowestState,
      highestState,
    };
  }, [data]);

  const topBottomThree = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const diff = a.group_grocery_income_ratio - b.group_grocery_income_ratio;
      if (Math.abs(diff) < 1e-9) {
        return a.state.localeCompare(b.state);
      }
      return diff;
    });

    return {
      top3: sorted.slice(-3).reverse(),
      bottom3: sorted.slice(0, 3),
    };
  }, [data]);

  const chart = useMemo(() => {
    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
    const maxRatio = Math.max(0, ...sortedRows.map((d) => d.group_grocery_income_ratio));
    const barWidth = sortedRows.length > 0 ? innerWidth / sortedRows.length : 0;

    return {
      innerWidth,
      innerHeight,
      maxRatio,
      barWidth,
    };
  }, [sortedRows]);

  const ratioRange = useMemo(() => {
    if (sortedRows.length === 0) {
      return { min: 0, max: 1 };
    }

    return {
      min: Math.min(...sortedRows.map((entry) => entry.group_grocery_income_ratio)),
      max: Math.max(...sortedRows.map((entry) => entry.group_grocery_income_ratio)),
    };
  }, [sortedRows]);

  const activeColorRange = GROUP_COLOR_RANGES[group];

  function updateTooltip(event: React.MouseEvent<SVGRectElement, MouseEvent>, item: ReturnType<typeof applyGroupAffordability>[number]) {
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

    setTooltip({ left: placement.left, top: placement.top, item });
  }

  if (rows.length === 0) {
    return <p className="text-[16px] text-[#757575]">Loading affordability ranking...</p>;
  }

  return (
    <section className="material-card w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[26px] font-bold text-[#212121]">Grocery Affordability Ranking</h2>
        <div className="flex flex-wrap items-center gap-2 text-[16px] text-[#757575]">
          <label className="flex items-center gap-2">
            <span className="font-bold text-[#212121]">Group</span>
            <select
              aria-label="Select affordability group"
              value={group}
              onChange={(event) => onGroupChange(event.target.value as AffordabilityGroup)}
              className="material-control px-3 py-1.5"
            >
              <option value="college-student">College Student</option>
              <option value="recent-graduate">Recent Graduate</option>
              <option value="young-adult">Young Adult</option>
            </select>
          </label>
          <span className="font-bold text-[#212121]">Sort</span>
          <button
            type="button"
            aria-label="Sort highest affordability burden first"
            className={`material-control px-3 py-1.5 ${sortOrder === "desc" ? "bg-[#3f51b5] text-white" : "bg-white text-[#212121]"}`}
            onClick={() => setSortOrder("desc")}
          >
            Highest First
          </button>
          <button
            type="button"
            aria-label="Sort lowest affordability burden first"
            className={`material-control px-3 py-1.5 ${sortOrder === "asc" ? "bg-[#3f51b5] text-white" : "bg-white text-[#212121]"}`}
            onClick={() => setSortOrder("asc")}
          >
            Lowest First
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#d6d6d6] bg-white px-3 py-2 text-[14px] text-[#212121]">
        <p>
          <span className="font-bold">Current palette:</span> {activeColorRange.label}
        </p>
      </div>

      <div className="rounded-md border border-[#ffccbc] bg-[#fff3ef] p-3 text-[14px] text-[#212121]">
        <p>
          <span className="font-bold text-[#e53935]">Top 3 least affordable:</span>{" "}
          {topBottomThree.top3.length > 0
            ? topBottomThree.top3
                .map((entry) => `${entry.state} (${(entry.group_grocery_income_ratio * 100).toFixed(1)}%)`)
                .join(", ")
            : "N/A"}
        </p>
        <p>
          <span className="font-bold text-[#8bc34a]">Top 3 most affordable:</span>{" "}
          {topBottomThree.bottom3.length > 0
            ? topBottomThree.bottom3
                .map((entry) => `${entry.state} (${(entry.group_grocery_income_ratio * 100).toFixed(1)}%)`)
                .join(", ")
            : "N/A"}
        </p>
      </div>

      <div ref={chartContainerRef} className="relative w-full overflow-hidden rounded-md border border-[#d6d6d6] bg-white">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Bar chart showing grocery to income ratio by state"
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {sortedRows.map((item, index) => {
              const x = index * chart.barWidth;
              const ratio = item.group_grocery_income_ratio;
              const height = chart.maxRatio === 0 ? 0 : (ratio / chart.maxRatio) * chart.innerHeight;
              const y = chart.innerHeight - height;
              const isHighest = item.state === extremes.highestState;
              const isLowest = item.state === extremes.lowestState;
              const denominator = ratioRange.max - ratioRange.min || 1;
              const t = (ratio - ratioRange.min) / denominator;
              const fill = isHighest
                ? activeColorRange.end
                : isLowest
                  ? activeColorRange.start
                  : interpolateHex(activeColorRange.start, activeColorRange.end, t);
              const isFirstLabel = index === 0;
              const isLastLabel = index === sortedRows.length - 1;
              const isMississippiBeforeGeorgia =
                item.state === "Mississippi" &&
                index === sortedRows.length - 2 &&
                sortedRows[sortedRows.length - 1]?.state === "Georgia";
              const shouldRenderLabel =
                (index % 4 === 0 || isFirstLabel || isLastLabel) &&
                !isMississippiBeforeGeorgia &&
                item.state !== "Tennessee";
              const lastLabelOffset = sortOrder === "asc" && item.state === "Colorado" ? -22 : isLastLabel ? -10 : 0;
              const labelX = x + chart.barWidth / 2 + lastLabelOffset;

              return (
                <g key={item.state}>
                  <rect
                    x={x + 1}
                    y={y}
                    width={Math.max(chart.barWidth - 2, 1)}
                    height={height}
                    fill={fill}
                    stroke={group === "recent-graduate" ? "#bdbdbd" : "none"}
                    strokeWidth={group === "recent-graduate" ? 0.7 : 0}
                    opacity={isHighest || isLowest ? 0.95 : 0.84}
                    onMouseMove={(event) => updateTooltip(event, item)}
                    onMouseEnter={(event) => updateTooltip(event, item)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {shouldRenderLabel && (
                    <text
                      x={labelX}
                      y={chart.innerHeight + 18}
                      transform={`rotate(60 ${labelX} ${chart.innerHeight + 18})`}
                      textAnchor="start"
                      className="chart-label fill-[#757575]"
                    >
                      {item.state}
                    </text>
                  )}
                </g>
              );
            })}

            <line x1={0} y1={chart.innerHeight} x2={chart.innerWidth} y2={chart.innerHeight} stroke="#bdbdbd" strokeWidth={1} />

            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const value = chart.maxRatio * tick;
              const y = chart.innerHeight - chart.innerHeight * tick;
              return (
                <g key={tick}>
                  <line x1={0} y1={y} x2={chart.innerWidth} y2={y} stroke="#eeeeee" strokeWidth={1} />
                  <text x={-10} y={y + 4} textAnchor="end" className="chart-label fill-[#757575]">
                    {(value * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-30 w-[292px] rounded-md bg-[#212121] p-3 text-white shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            <p className="chart-label font-medium">{tooltip.item.state}</p>
            <p className="chart-label">
              Grocery ratio ({GROUP_LABELS[group]}): {(tooltip.item.group_grocery_income_ratio * 100).toFixed(1)}%
            </p>
            <p className="chart-label">Median income: {formatMoney(tooltip.item.median_income)}</p>
            <p className="chart-label">Food insecurity: {tooltip.item.food_insecurity_rate.toFixed(1)}%</p>
          </div>
        )}
      </div>

      <div className="rounded-md bg-[#f5f5f5] p-4 text-[16px] leading-6 text-[#757575]">
        This ranking chart makes the affordability gap explicit by sorting every state by grocery burden for the
        selected group, either Highest First or Lowest First. The chart visually emphasizes one highest-burden state
        and one lowest-burden state, while the summary box above lists the top three least affordable and top three
        most affordable states with percentages. That combination keeps the view readable while still giving broader
        context beyond a single winner and loser. As you switch among College Student, Recent Graduate, and Young
        Adult, the rankings update to reflect how the same grocery costs affect different income levels. The practical
        takeaway is to compare both the extremes and the top/bottom three range, since that spread better captures how
        much location can influence monthly budget pressure.
      </div>
    </section>
  );
}
