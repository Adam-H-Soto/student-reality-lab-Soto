import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";

import type { StateFoodData } from "./schema";

interface RawStateFoodRow {
	state?: string;
	annual_food_cost?: string;
	median_young_adult_income?: string;
}

function parseNumericField(value: string | undefined, fieldName: string, rowNumber: number): number {
	const parsed = Number(value);

	if (!Number.isFinite(parsed)) {
		throw new Error(`Invalid numeric value for ${fieldName} at CSV row ${rowNumber}.`);
	}

	return parsed;
}

export async function loadStateFoodData(): Promise<StateFoodData[]> {
	const csvPath = path.join(process.cwd(), "data", "raw_state_food_income.csv");
	const csvContent = await readFile(csvPath, "utf-8");

	const parsed = Papa.parse<RawStateFoodRow>(csvContent, {
		header: true,
		skipEmptyLines: true,
	});

	if (parsed.errors.length > 0) {
		throw new Error(`Failed to parse CSV data: ${parsed.errors[0]?.message ?? "Unknown parse error"}`);
	}

	return parsed.data.map((row, index) => {
		const rowNumber = index + 2;
		const state = row.state?.trim();

		if (!state) {
			throw new Error(`Missing state value at CSV row ${rowNumber}.`);
		}

		const annualFoodCost = parseNumericField(row.annual_food_cost, "annual_food_cost", rowNumber);
		const medianYoungAdultIncome = parseNumericField(
			row.median_young_adult_income,
			"median_young_adult_income",
			rowNumber,
		);

		const monthlyFoodCost = annualFoodCost / 12;
		const monthlyIncome = medianYoungAdultIncome / 12;

		if (monthlyIncome === 0) {
			throw new Error(`monthly_income cannot be zero at CSV row ${rowNumber}.`);
		}

		return {
			state,
			annual_food_cost: annualFoodCost,
			median_young_adult_income: medianYoungAdultIncome,
			monthly_food_cost: monthlyFoodCost,
			monthly_income: monthlyIncome,
			grocery_income_ratio: monthlyFoodCost / monthlyIncome,
		};
	});
}
