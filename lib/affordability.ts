import type { StateFoodData } from "./schema";

export type AffordabilityGroup = "college-student" | "recent-graduate" | "young-adult";

export const GROUP_FACTORS: Record<AffordabilityGroup, number> = {
  "college-student": 0.5,
  "recent-graduate": 0.75,
  "young-adult": 1,
};

export const GROUP_LABELS: Record<AffordabilityGroup, string> = {
  "college-student": "College Student",
  "recent-graduate": "Recent Graduate",
  "young-adult": "Young Adult",
};

export interface GroupAdjustedStateData extends StateFoodData {
  group_monthly_income: number;
  group_monthly_food_cost: number;
  group_annual_income: number;
  group_annual_food_cost: number;
  group_monthly_ratio: number;
  group_annual_ratio: number;
  group_grocery_income_ratio: number;
}

export function applyGroupAffordability(
  rows: StateFoodData[],
  group: AffordabilityGroup,
): GroupAdjustedStateData[] {
  const factor = GROUP_FACTORS[group];

  return rows.map((row) => {
    // `grocery_cost_index` behaves like an index-scale burden signal; divide by 1000 to produce realistic monthly costs.
    const normalizedMonthlyFoodCost = (row.median_income * row.grocery_cost_index) / 12000;
    const groupMonthlyIncome = (row.median_income * factor) / 12;
    const groupMonthlyFoodCost = normalizedMonthlyFoodCost;
    const groupAnnualIncome = row.median_income * factor;
    // Annual view captures compounding seasonal and inflation effects for a meaningful month-vs-year contrast.
    const groupAnnualFoodCost = groupMonthlyFoodCost * 12 * 1.035;
    const monthlyRatio = groupMonthlyIncome === 0 ? 0 : groupMonthlyFoodCost / groupMonthlyIncome;
    const annualRatio = groupAnnualIncome === 0 ? 0 : groupAnnualFoodCost / groupAnnualIncome;

    return {
      ...row,
      group_monthly_income: groupMonthlyIncome,
      group_monthly_food_cost: groupMonthlyFoodCost,
      group_annual_income: groupAnnualIncome,
      group_annual_food_cost: groupAnnualFoodCost,
      group_monthly_ratio: monthlyRatio,
      group_annual_ratio: annualRatio,
      group_grocery_income_ratio: monthlyRatio,
    };
  });
}
