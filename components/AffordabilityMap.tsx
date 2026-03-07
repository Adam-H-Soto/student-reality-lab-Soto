"use client";

import { useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import statesTopology from "us-atlas/states-10m.json";

import { GROUP_LABELS, applyGroupAffordability, type AffordabilityGroup } from "@/lib/affordability";
import type { StateFoodData } from "@/lib/schema";
import { getTooltipPlacement } from "@/lib/tooltip";
import type { Feature as GeoFeature, FeatureCollection, Geometry } from "geojson";

type TooltipState = {
  left: number;
  top: number;
  stateName: string;
  data?: ReturnType<typeof applyGroupAffordability>[number];
} | null;

interface AffordabilityMapProps {
  rows: StateFoodData[];
  group: AffordabilityGroup;
  onGroupChange: (group: AffordabilityGroup) => void;
}

const MAP_WIDTH = 975;
const MAP_HEIGHT = 610;
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

const STATE_FIPS_TO_NAME: Record<string, string> = {
  "01": "Alabama",
  "02": "Alaska",
  "04": "Arizona",
  "05": "Arkansas",
  "06": "California",
  "08": "Colorado",
  "09": "Connecticut",
  "10": "Delaware",
  "12": "Florida",
  "13": "Georgia",
  "15": "Hawaii",
  "16": "Idaho",
  "17": "Illinois",
  "18": "Indiana",
  "19": "Iowa",
  "20": "Kansas",
  "21": "Kentucky",
  "22": "Louisiana",
  "23": "Maine",
  "24": "Maryland",
  "25": "Massachusetts",
  "26": "Michigan",
  "27": "Minnesota",
  "28": "Mississippi",
  "29": "Missouri",
  "30": "Montana",
  "31": "Nebraska",
  "32": "Nevada",
  "33": "New Hampshire",
  "34": "New Jersey",
  "35": "New Mexico",
  "36": "New York",
  "37": "North Carolina",
  "38": "North Dakota",
  "39": "Ohio",
  "40": "Oklahoma",
  "41": "Oregon",
  "42": "Pennsylvania",
  "44": "Rhode Island",
  "45": "South Carolina",
  "46": "South Dakota",
  "47": "Tennessee",
  "48": "Texas",
  "49": "Utah",
  "50": "Vermont",
  "51": "Virginia",
  "53": "Washington",
  "54": "West Virginia",
  "55": "Wisconsin",
  "56": "Wyoming",
};

const projection = geoAlbersUsa().translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]).scale(1300);
const pathGenerator = geoPath(projection);

const stateFeatures = (
  feature(
    statesTopology as unknown as Parameters<typeof feature>[0],
    (statesTopology as { objects: { states: unknown } }).objects.states as unknown as Parameters<typeof feature>[1],
  ) as unknown as FeatureCollection<Geometry>
).features as GeoFeature<Geometry>[];

function toMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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

function normalizeFips(rawId: string | number | undefined): string | null {
  if (rawId === undefined) {
    return null;
  }

  const value = String(rawId).padStart(2, "0");
  return STATE_FIPS_TO_NAME[value] ? value : null;
}

export default function AffordabilityMap({ rows, group, onGroupChange }: AffordabilityMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => applyGroupAffordability(rows, group), [rows, group]);

  const dataByState = useMemo(() => {
    return new Map<string, ReturnType<typeof applyGroupAffordability>[number]>(
      data.map((entry) => [entry.state, entry]),
    );
  }, [data]);

  const ratioRange = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 1 };
    }

    return {
      min: Math.min(...data.map((entry) => entry.group_grocery_income_ratio)),
      max: Math.max(...data.map((entry) => entry.group_grocery_income_ratio)),
    };
  }, [data]);

  const extremes = useMemo(() => {
    if (data.length === 0) {
      return { lowest: null, highest: null } as const;
    }

    const sorted = [...data].sort((a, b) => a.group_grocery_income_ratio - b.group_grocery_income_ratio);
    return { lowest: sorted[0], highest: sorted[sorted.length - 1] } as const;
  }, [data]);

  const activeColorRange = GROUP_COLOR_RANGES[group];

  function getFillColor(stateName: string): string {
    const row = dataByState.get(stateName);

    if (!row) {
      return "#dcdcdc";
    }

    const denominator = ratioRange.max - ratioRange.min || 1;
    const t = (row.group_grocery_income_ratio - ratioRange.min) / denominator;

    return interpolateHex(activeColorRange.start, activeColorRange.end, t);
  }

  function getStroke(stateName: string): { color: string; width: number } {
    if (extremes.highest?.state === stateName) {
      return { color: "#ff5722", width: 2.4 };
    }

    if (extremes.lowest?.state === stateName) {
      return { color: "#3f51b5", width: 2.4 };
    }

    return { color: "#ffffff", width: 0.9 };
  }

  function handleMouseMove(
    event: React.MouseEvent<SVGPathElement, MouseEvent>,
    stateName: string,
    row: ReturnType<typeof applyGroupAffordability>[number] | undefined,
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

    setTooltip({
      left: placement.left,
      top: placement.top,
      stateName,
      data: row,
    });
  }

  return (
    <section className="material-card w-full space-y-4">
      <h2 className="text-[26px] font-bold text-[#212121]">Affordability Map</h2>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#d6d6d6] bg-[#f5f5f5] p-4">
        <label className="flex min-w-72 flex-1 flex-col gap-1 text-[16px] text-[#757575]">
          <span className="font-bold text-[#212121]">Select group</span>
          <select
            aria-label="Select affordability group"
            value={group}
            onChange={(event) => onGroupChange(event.target.value as AffordabilityGroup)}
            className="material-control px-3 py-2"
          >
            <option value="college-student">College Student</option>
            <option value="recent-graduate">Recent Graduate</option>
            <option value="young-adult">Young Adult</option>
          </select>
        </label>

        <div className="rounded-md border border-[#d6d6d6] bg-white px-3 py-2 text-[14px] text-[#212121]">
          <p>
            <span className="font-bold">Most expensive:</span> {extremes.highest?.state ?? "N/A"}
          </p>
          <p>
            <span className="font-bold">Most affordable:</span> {extremes.lowest?.state ?? "N/A"}
          </p>
          <p>
            <span className="font-bold">Current palette:</span> {activeColorRange.label}
          </p>
        </div>
      </div>

      <div ref={chartContainerRef} className="relative w-full overflow-hidden rounded-md border border-[#d6d6d6] bg-white">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="U.S. map showing grocery affordability ratio by state"
        >
          {stateFeatures.map((stateFeature) => {
            const fips = normalizeFips((stateFeature.id ?? undefined) as string | number | undefined);
            const stateName = fips ? STATE_FIPS_TO_NAME[fips] : "Unknown";
            const row = dataByState.get(stateName);
            const d = pathGenerator(stateFeature);

            if (!d) {
              return null;
            }

            const stroke = getStroke(stateName);

            return (
              <path
                key={String(stateFeature.id)}
                d={d}
                fill={getFillColor(stateName)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                className="transition-colors duration-150"
                onMouseEnter={(event) => handleMouseMove(event, stateName, row)}
                onMouseMove={(event) => handleMouseMove(event, stateName, row)}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 w-[292px] rounded-md bg-[#212121] p-3 text-white shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            <p className="chart-label font-medium">{tooltip.stateName}</p>
            {tooltip.data ? (
              <>
                <p className="chart-label">
                  Grocery ratio ({GROUP_LABELS[group]}): {(tooltip.data.group_grocery_income_ratio * 100).toFixed(1)}%
                </p>
                <p className="chart-label">Median income: {toMoney(tooltip.data.median_income)}</p>
                <p className="chart-label">Food insecurity: {tooltip.data.food_insecurity_rate.toFixed(1)}%</p>
              </>
            ) : (
              <p className="chart-label">No data available</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md bg-[#f5f5f5] p-4 text-[16px] leading-6 text-[#757575]">
        The map gives a geographic overview of how hard groceries hit each budget group. Switching between College
        Student, Recent Graduate, and Young Adult scales income while holding food cost constant, so darker states
        represent places where groceries consume a larger share of available earnings. The most expensive state and
        most affordable state are always highlighted to anchor interpretation, helping you compare extremes rather than
        only mid-range patterns. For students, that contrast is the key story: two states can have similar headline
        incomes, yet very different everyday affordability once grocery burden is normalized. When the student view is
        selected, dark regions expand because lower effective income amplifies stress from the same food prices. In the
        young-adult view, the burden narrows but the same states still tend to remain at the top and bottom, which
        signals structural differences rather than random variation. The takeaway is practical and location-specific:
        identify where grocery burden is persistently highest and where it remains lightest, then use that range to
        plan relocation, school decisions, and realistic monthly budgeting.
      </div>
    </section>
  );
}
