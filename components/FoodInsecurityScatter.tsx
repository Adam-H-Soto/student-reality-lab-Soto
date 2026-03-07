"use client";

import { useMemo, useRef, useState } from "react";

import { GROUP_LABELS, applyGroupAffordability, type AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";
import { getTooltipPlacement } from "@/lib/tooltip";

type TooltipState = {
  left: number;
  top: number;
  item: ReturnType<typeof applyGroupAffordability>[number];
} | null;

interface RatioRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface FoodInsecurityScatterProps {
  rows: StateFoodData[];
  group: AffordabilityGroup;
}

const WIDTH = 980;
const HEIGHT = 500;
const MARGIN = { top: 30, right: 25, bottom: 55, left: 88 };
const TOOLTIP_WIDTH = 292;
const TOOLTIP_HEIGHT = 120;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FoodInsecurityScatter({ rows, group }: FoodInsecurityScatterProps) {
  const [bracket, setBracket] = useState<string>("all");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => applyGroupAffordability(rows, group), [rows, group]);

  const ratioRangeOptions = useMemo(() => {
    if (data.length === 0) {
      return [] as RatioRangeOption[];
    }

    const ratioValues = data.map((row) => row.group_grocery_income_ratio * 100);
    const minPercent = Math.floor(Math.min(...ratioValues));
    const maxPercent = Math.ceil(Math.max(...ratioValues));
    const span = Math.max(1, maxPercent - minPercent);
    const targetBins = 4;
    const step = Math.max(1, Math.ceil(span / targetBins));

    const options: RatioRangeOption[] = [];
    for (let start = minPercent; start < maxPercent; start += step) {
      const end = Math.min(start + step, maxPercent);
      options.push({
        id: `${start}-${end}`,
        label: `${start}% to ${end}%`,
        min: start,
        max: end,
      });
    }

    if (options.length === 0) {
      options.push({
        id: `${minPercent}-${maxPercent}`,
        label: `${minPercent}% to ${maxPercent}%`,
        min: minPercent,
        max: maxPercent,
      });
    }

    return options;
  }, [data]);

  const activeBracket = useMemo(() => {
    if (bracket === "all") {
      return "all";
    }

    return ratioRangeOptions.some((option) => option.id === bracket) ? bracket : "all";
  }, [bracket, ratioRangeOptions]);

  const filtered = useMemo(() => {
    if (activeBracket === "all") {
      return data;
    }

    const selectedRange = ratioRangeOptions.find((option) => option.id === activeBracket);
    if (!selectedRange) {
      return data;
    }

    return data.filter((row) => {
      const ratioPercent = row.group_grocery_income_ratio * 100;
      const isLastRange = selectedRange.max === ratioRangeOptions[ratioRangeOptions.length - 1]?.max;

      if (isLastRange) {
        return ratioPercent >= selectedRange.min && ratioPercent <= selectedRange.max;
      }

      return ratioPercent >= selectedRange.min && ratioPercent < selectedRange.max;
    });
  }, [data, activeBracket, ratioRangeOptions]);

  const metrics = useMemo(() => {
    if (filtered.length === 0) {
      return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
    }

    const ratioValues = filtered.map((d) => d.group_grocery_income_ratio * 100);
    const foodValues = filtered.map((d) => d.food_insecurity_rate);

    const xMin = Math.min(...ratioValues);
    const xMax = Math.max(...ratioValues);
    const yMin = Math.min(...foodValues);
    const yMax = Math.max(...foodValues);

    return { xMin, xMax, yMin, yMax };
  }, [filtered]);

  const extremes = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.group_grocery_income_ratio - b.group_grocery_income_ratio);
    return { lowest: sorted[0], highest: sorted[sorted.length - 1] };
  }, [data]);

  if (rows.length === 0) {
    return <p className="text-[16px] text-[#757575]">Loading food insecurity scatter...</p>;
  }

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const scaleX = (value: number): number => {
    const denom = metrics.xMax - metrics.xMin || 1;
    return ((value - metrics.xMin) / denom) * innerWidth;
  };

  const scaleY = (value: number): number => {
    const denom = metrics.yMax - metrics.yMin || 1;
    return innerHeight - ((value - metrics.yMin) / denom) * innerHeight;
  };

  const xSpan = metrics.xMax - metrics.xMin;
  const xTickDecimals = xSpan < 1 ? 2 : xSpan < 5 ? 1 : 0;

  function updateTooltip(event: React.MouseEvent<SVGCircleElement, MouseEvent>, item: ReturnType<typeof applyGroupAffordability>[number]) {
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

  return (
    <section className="material-card w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[26px] font-bold text-[#212121]">Food Insecurity vs Affordability</h2>
        <div className="flex items-center gap-2 text-[16px] text-[#757575]">
          <label htmlFor="bracket" className="font-bold text-[#212121]">
            Filter
          </label>
          <select
            id="bracket"
            aria-label="Filter scatter plot by affordability bracket"
            value={activeBracket}
            onChange={(event) => setBracket(event.target.value)}
            className="material-control px-2 py-1.5"
          >
            <option value="all">All states</option>
            {ratioRangeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-[#c5cae9] bg-[#eef1ff] p-3 text-[14px] text-[#212121]">
        <span className="font-bold">Dual highlight:</span> Highest ratio state: {extremes.highest?.state ?? "N/A"};
        lowest ratio state: {extremes.lowest?.state ?? "N/A"}.
      </div>

      <div ref={chartContainerRef} className="relative w-full overflow-hidden rounded-md border border-[#d6d6d6] bg-white">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Scatter plot of grocery affordability ratio and food insecurity rate"
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = innerHeight - innerHeight * tick;
              const value = metrics.yMin + (metrics.yMax - metrics.yMin) * tick;
              return (
                <g key={`y-${tick}`}>
                  <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#eeeeee" strokeWidth={1} />
                  <text x={-12} y={y + 4} textAnchor="end" className="chart-label fill-[#757575]">
                    {value.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const x = innerWidth * tick;
              const value = metrics.xMin + (metrics.xMax - metrics.xMin) * tick;
              return (
                <g key={`x-${tick}`}>
                  <line x1={x} y1={0} x2={x} y2={innerHeight} stroke="#f1f5f9" strokeWidth={1} />
                  <text x={x} y={innerHeight + 18} textAnchor="middle" className="chart-label fill-[#757575]">
                    {value.toFixed(xTickDecimals)}%
                  </text>
                </g>
              );
            })}

            {filtered.map((item) => {
              const ratioPercent = item.group_grocery_income_ratio * 100;
              const x = scaleX(ratioPercent);
              const y = scaleY(item.food_insecurity_rate);
              const isHighest = item.state === extremes.highest?.state;
              const isLowest = item.state === extremes.lowest?.state;

              return (
                <circle
                  key={item.state}
                  cx={x}
                  cy={y}
                  r={isHighest || isLowest ? 6 : 4.5}
                  fill={isHighest ? "#e53935" : isLowest ? "#8bc34a" : "#3f51b5"}
                  opacity={0.85}
                  stroke={isHighest ? "#ff5722" : isLowest ? "#3f51b5" : "#536dfe"}
                  strokeWidth={1}
                  onMouseMove={(event) => updateTooltip(event, item)}
                  onMouseEnter={(event) => updateTooltip(event, item)}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

            <text x={innerWidth / 2} y={innerHeight + 40} textAnchor="middle" className="chart-label fill-[#757575]">
              Grocery income ratio (%)
            </text>
            <text
              x={-64}
              y={innerHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 -64 ${innerHeight / 2})`}
              className="chart-label fill-[#757575]"
            >
              Food insecurity rate (%)
            </text>
          </g>
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-30 w-[292px] rounded-md bg-[#212121] p-3 text-white shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            <p className="chart-label font-medium">{tooltip.item.state}</p>
            <p className="chart-label">
              Grocery-income ratio ({GROUP_LABELS[group]}): {(tooltip.item.group_grocery_income_ratio * 100).toFixed(2)}%
            </p>
            <p className="chart-label">Food insecurity rate: {tooltip.item.food_insecurity_rate.toFixed(1)}%</p>
            <p className="chart-label">Median income: {formatMoney(tooltip.item.median_income)}</p>
          </div>
        )}
      </div>

      <div className="rounded-md bg-[#f5f5f5] p-4 text-[16px] leading-6 text-[#757575]">
        The scatter plot connects affordability and food insecurity while keeping the two ratio extremes visible in
        every group view. The highest-ratio state and lowest-ratio state are highlighted so you can compare their
        vertical positions directly and see whether food insecurity tracks burden perfectly or only partially. That
        distinction matters for students: a state may be among the least affordable yet not have the single highest
        insecurity rate, which suggests additional social and policy factors influence outcomes beyond grocery prices
        alone. The affordability-bracket filter helps narrow comparisons to similar burden levels, making outliers
        easier to interpret. When you switch to College Student or Recent Graduate income assumptions, points shift
        right as grocery burden rises, but not all points move upward in insecurity, reinforcing that affordability is
        one major driver, not the only one. The key takeaway is to combine both extremes with trend context so
        relocation decisions reflect real student risk rather than a single metric.
      </div>
    </section>
  );
}
