/**
 * State Data Aggregator
 * Combines data from multiple sources into a unified state dataset
 */

import { loadDataset } from "./loadDataset";
import {
  fetchTaxData,
  fetchIncomeData,
  fetchHousingData,
  fetchLifestyleData,
  getStateCode
} from "./apiIntegration";
import type { UnifiedStateData, StateFoodData } from "./schema";

interface AggregationCache {
  data: UnifiedStateData[] | null;
  timestamp: number;
  ttl: number; // Cache time-to-live in milliseconds
}

let aggregationCache: AggregationCache = {
  data: null,
  timestamp: 0,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Aggregate all state data from multiple sources
 */
export async function aggregateAllStateData(): Promise<UnifiedStateData[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (
    aggregationCache.data &&
    now - aggregationCache.timestamp < aggregationCache.ttl
  ) {
    return aggregationCache.data;
  }

  try {
    // Load base food/grocery data
    const foodData = await loadDataset();
    
    // Create map of food data by state
    const foodDataMap = new Map<string, StateFoodData>();
    for (const item of foodData) {
      foodDataMap.set(item.state, item);
    }

    // Aggregate data for all states
    const aggregatedData: UnifiedStateData[] = [];

    for (const stateName of Object.keys(STATE_NAMES)) {
      const stateCode = getStateCode(stateName);
      const foodItem = foodDataMap.get(stateName);

      if (!foodItem) {
        console.warn(`No food data found for ${stateName}`);
        continue;
      }

      // Fetch data from all sources
      const [taxData, incomeData, housingData, lifestyleData] = await Promise.all([
        fetchTaxData(stateCode),
        fetchIncomeData(stateName, stateCode),
        fetchHousingData(stateCode),
        fetchLifestyleData(stateName, stateCode)
      ]);

      // Calculate data completeness
      const fieldCount = Object.values(taxData).filter(v => v !== null).length +
                        (incomeData.median_household_income > 0 ? 1 : 0) +
                        (housingData.median_home_price !== null ? 1 : 0) +
                        Object.values(lifestyleData).filter(
                          v => v !== null && typeof v !== 'object'
                        ).length;
      const totalFields = 12; // Total possible fields
      const completeness = fieldCount / totalFields;

      const unified: UnifiedStateData = {
        state: stateName,
        state_code: stateCode,
        taxes: taxData,
        income: incomeData,
        housing: housingData,
        lifestyle: lifestyleData,
        food_insecurity_rate: foodItem.food_insecurity_rate,
        median_grocery_cost_index: foodItem.grocery_cost_index,
        last_updated: new Date().toISOString(),
        data_completeness: completeness
      };

      aggregatedData.push(unified);
    }

    // Sort by state name for consistency
    aggregatedData.sort((a, b) => a.state.localeCompare(b.state));

    // Cache the result
    aggregationCache = {
      data: aggregatedData,
      timestamp: now,
      ttl: 24 * 60 * 60 * 1000
    };

    return aggregatedData;
  } catch (error) {
    console.error("Error aggregating state data:", error);
    throw error;
  }
}

/**
 * Get data for a single state
 */
export async function getSingleStateData(stateName: string): Promise<UnifiedStateData | null> {
  const allData = await aggregateAllStateData();
  return allData.find(
    state => state.state.toLowerCase() === stateName.toLowerCase()
  ) || null;
}

/**
 * Clear aggregation cache (useful for manual refresh)
 */
export function clearAggregationCache(): void {
  aggregationCache = {
    data: null,
    timestamp: 0,
    ttl: 24 * 60 * 60 * 1000
  };
}

/**
 * Force refresh of aggregation data
 */
export async function refreshAggregationCache(): Promise<UnifiedStateData[]> {
  clearAggregationCache();
  return aggregateAllStateData();
}

/**
 * Get cache status
 */
export function getCacheStatus() {
  const now = Date.now();
  const age = now - aggregationCache.timestamp;
  const isValid = age < aggregationCache.ttl;
  
  return {
    isCached: aggregationCache.data !== null,
    isValid,
    ageMs: age,
    ageMinutes: Math.round(age / 60000),
    ttlMinutes: Math.round(aggregationCache.ttl / 60000),
    dataPoints: aggregationCache.data?.length || 0
  };
}

// All states in the US
const STATE_NAMES: Record<string, boolean> = {
  "Alabama": true,
  "Alaska": true,
  "Arizona": true,
  "Arkansas": true,
  "California": true,
  "Colorado": true,
  "Connecticut": true,
  "Delaware": true,
  "Florida": true,
  "Georgia": true,
  "Hawaii": true,
  "Idaho": true,
  "Illinois": true,
  "Indiana": true,
  "Iowa": true,
  "Kansas": true,
  "Kentucky": true,
  "Louisiana": true,
  "Maine": true,
  "Maryland": true,
  "Massachusetts": true,
  "Michigan": true,
  "Minnesota": true,
  "Mississippi": true,
  "Missouri": true,
  "Montana": true,
  "Nebraska": true,
  "Nevada": true,
  "New Hampshire": true,
  "New Jersey": true,
  "New Mexico": true,
  "New York": true,
  "North Carolina": true,
  "North Dakota": true,
  "Ohio": true,
  "Oklahoma": true,
  "Oregon": true,
  "Pennsylvania": true,
  "Rhode Island": true,
  "South Carolina": true,
  "South Dakota": true,
  "Tennessee": true,
  "Texas": true,
  "Utah": true,
  "Vermont": true,
  "Virginia": true,
  "Washington": true,
  "West Virginia": true,
  "Wisconsin": true,
  "Wyoming": true
};
