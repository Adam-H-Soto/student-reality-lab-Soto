/**
 * Data Formatting Utilities
 * Consistent formatting across the application
 */

import type { UnifiedStateData } from "./schema";

/**
 * Format currency value
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) {
    return "Data unavailable";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) {
    return "Data unavailable";
  }
  return (value).toFixed(decimals) + "%";
}

/**
 * Format score (0-100)
 */
export function formatScore(value: number | null, decimals: number = 1): string {
  if (value === null || value === undefined) {
    return "Data unavailable";
  }
  return (value).toFixed(decimals) + "/100";
}

/**
 * Format crime rate (per 100k)
 */
export function formatCrimeRate(value: number | null): string {
  if (value === null || value === undefined) {
    return "Data unavailable";
  }
  return value.toLocaleString() + " per 100k";
}

/**
 * Format large number with comma separators
 */
export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) {
    return "Data unavailable";
  }
  return value.toLocaleString();
}

/**
 * Get color for safety score (red -> yellow -> green)
 */
export function getSafetyColor(safetyIndex: number | null): string {
  if (safetyIndex === null || safetyIndex === undefined) {
    return "#999999"; // Gray for unknown
  }

  if (safetyIndex < 30) return "#EF4444"; // Red
  if (safetyIndex < 50) return "#F97316"; // Orange
  if (safetyIndex < 70) return "#FACC15"; // Yellow
  return "#22C55E"; // Green
}

/**
 * Get color for affordability score (red -> yellow -> green)
 */
export function getAffordabilityColor(foodInsecurityRate: number | null): string {
  if (foodInsecurityRate === null || foodInsecurityRate === undefined) {
    return "#999999"; // Gray for unknown
  }

  if (foodInsecurityRate > 15) return "#EF4444"; // Red
  if (foodInsecurityRate > 12) return "#F97316"; // Orange
  if (foodInsecurityRate > 9) return "#FACC15"; // Yellow
  return "#22C55E"; // Green
}

/**
 * Format complete state data for display
 */
export function formatStateDataForDisplay(state: UnifiedStateData): FormattedStateDisplay {
  return {
    stateName: state.state,
    stateCode: state.state_code,
    
    taxes: {
      incomeTax: formatPercentage(state.taxes.income_tax_rate, 2),
      salesTax: formatPercentage(state.taxes.sales_tax_rate, 2),
      propertyTax: formatPercentage(state.taxes.property_tax_rate, 2)
    },
    
    income: {
      medianHouseholdIncome: formatCurrency(state.income.median_household_income),
      source: state.income.data_source,
      year: state.income.year
    },
    
    housing: {
      medianHomePrice: formatCurrency(state.housing.median_home_price),
      source: state.housing.data_source
    },
    
    lifestyle: {
      nightlifeScore: formatScore(state.lifestyle.nightlife_score),
      topIndustries: state.lifestyle.top_industries.join(", "),
      safetyIndex: formatScore(state.lifestyle.safety_index),
      crimeRate: formatCrimeRate(state.lifestyle.crime_rate),
      source: state.lifestyle.data_source
    },
    
    food: {
      insecurityRate: formatPercentage(state.food_insecurity_rate, 1),
      groceryCostIndex: state.median_grocery_cost_index.toFixed(1)
    },
    
    metadata: {
      lastUpdated: new Date(state.last_updated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      completeness: (state.data_completeness * 100).toFixed(0) + "%"
    },

    colors: {
      safety: getSafetyColor(state.lifestyle.safety_index),
      affordability: getAffordabilityColor(state.food_insecurity_rate)
    }
  };
}

export interface FormattedStateDisplay {
  stateName: string;
  stateCode: string;
  taxes: {
    incomeTax: string;
    salesTax: string;
    propertyTax: string;
  };
  income: {
    medianHouseholdIncome: string;
    source: string;
    year: number;
  };
  housing: {
    medianHomePrice: string;
    source: string;
  };
  lifestyle: {
    nightlifeScore: string;
    topIndustries: string;
    safetyIndex: string;
    crimeRate: string;
    source: string;
  };
  food: {
    insecurityRate: string;
    groceryCostIndex: string;
  };
  metadata: {
    lastUpdated: string;
    completeness: string;
  };
  colors: {
    safety: string;
    affordability: string;
  };
}

/**
 * Get summary info for tooltip
 */
export function getTooltipInfo(state: UnifiedStateData) {
  return {
    name: state.state,
    medianIncome: formatCurrency(state.income.median_household_income),
    medianHomePrice: formatCurrency(state.housing.median_home_price),
    foodInsecurity: formatPercentage(state.food_insecurity_rate, 1),
    safetyIndex: formatScore(state.lifestyle.safety_index, 1)
  };
}
