export interface StateFoodData {
  state: string;
  population: number;
  median_income: number;
  grocery_cost_index: number;
  food_insecurity_rate: number;
  monthly_food_cost: number;
  monthly_income: number;
  grocery_income_ratio: number;
}

// Enhanced unified state data schema
export interface TaxData {
  income_tax_rate: number | null; // Percentage
  sales_tax_rate: number | null; // Percentage
  property_tax_rate: number | null; // Percentage
}

export interface IncomeData {
  median_household_income: number; // USD
  data_source: string;
  year: number;
}

export interface HousingData {
  median_home_price: number | null; // USD
  data_source: string;
}

export interface LifestyleData {
  nightlife_score: number | null; // 0-100
  top_industries: string[]; // Top 3-5 industries
  safety_index: number | null; // 0-100 normalized
  crime_rate: number | null; // Per 100k population
  data_source: string;
}

export interface UnifiedStateData {
  state: string;
  state_code: string; // Two-letter code (e.g., "CA")
  
  // Tax information
  taxes: TaxData;
  
  // Income information
  income: IncomeData;
  
  // Housing information
  housing: HousingData;
  
  // Lifestyle information
  lifestyle: LifestyleData;
  
  // Original food/grocery data
  food_insecurity_rate: number;
  median_grocery_cost_index: number;
  
  // Metadata
  last_updated: string; // ISO timestamp
  data_completeness: number; // 0-1 indicating percentage of available data
}
