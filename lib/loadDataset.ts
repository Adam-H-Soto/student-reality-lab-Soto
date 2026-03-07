import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";

import type { StateFoodData } from "./schema";

interface RawGroceryGapRow {
  state?: string;
  population?: string;
  median_income?: string;
  grocery_cost_index?: string;
  food_insecurity_rate?: string;
}

function parseNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loadDataset(): Promise<StateFoodData[]> {
  const csvPath = path.join(process.cwd(), "data", "grocery_gap_clean.csv");
  const csvContent = await readFile(csvPath, "utf-8");

  const parsed = Papa.parse<RawGroceryGapRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Failed to parse CSV: ${parsed.errors[0]?.message ?? "Unknown parse error"}`);
  }

  const cleanedRows: StateFoodData[] = [];

  for (const row of parsed.data) {
    const state = row.state?.trim();
    const population = parseNumber(row.population);
    const medianIncome = parseNumber(row.median_income);
    const groceryCostIndex = parseNumber(row.grocery_cost_index);
    const foodInsecurityRate = parseNumber(row.food_insecurity_rate);

    // Skip rows with missing/invalid required values.
    if (
      !state ||
      population === null ||
      medianIncome === null ||
      groceryCostIndex === null ||
      foodInsecurityRate === null
    ) {
      continue;
    }

    const monthlyFoodCost = (medianIncome * groceryCostIndex) / 12 / 100;
    const monthlyIncome = medianIncome / 12;

    if (monthlyIncome === 0) {
      continue;
    }

    cleanedRows.push({
      state,
      population,
      median_income: medianIncome,
      grocery_cost_index: groceryCostIndex,
      food_insecurity_rate: foodInsecurityRate,
      monthly_food_cost: monthlyFoodCost,
      monthly_income: monthlyIncome,
      grocery_income_ratio: monthlyFoodCost / monthlyIncome,
    });
  }

  return cleanedRows;
}
