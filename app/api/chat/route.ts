import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { aggregateAllStateData } from "@/lib/stateDataAggregator";
import { formatCurrency, formatPercentage, formatScore } from "@/lib/formatData";
import type { UnifiedStateData } from "@/lib/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatUnifiedStateData(state: UnifiedStateData): string {
  const lines = [
    `${state.state} (${state.state_code}):`,
    "",
    "  TAXES:",
    `    • Income Tax: ${formatPercentage(state.taxes.income_tax_rate, 2)}`,
    `    • Sales Tax: ${formatPercentage(state.taxes.sales_tax_rate, 2)}`,
    `    • Property Tax: ${formatPercentage(state.taxes.property_tax_rate, 2)}`,
    "",
    "  INCOME:",
    `    • Median Household Income: ${formatCurrency(state.income.median_household_income)}`,
    `    • Source: ${state.income.data_source} (${state.income.year})`,
    "",
    "  HOUSING:",
    `    • Median Home Price: ${formatCurrency(state.housing.median_home_price)}`,
    `    • Source: ${state.housing.data_source}`,
    "",
    "  LIFESTYLE & SAFETY:",
    `    • Nightlife Score: ${formatScore(state.lifestyle.nightlife_score)}`,
    `    • Safety Index: ${formatScore(state.lifestyle.safety_index)}`,
    `    • Crime Rate: ${state.lifestyle.crime_rate ? (state.lifestyle.crime_rate).toFixed(0) + " per 100k" : "Data unavailable"}`,
    `    • Top Industries: ${state.lifestyle.top_industries.join(", ")}`,
    `    • Source: ${state.lifestyle.data_source}`,
    "",
    "  FOOD & AFFORDABILITY:",
    `    • Food Insecurity Rate: ${formatPercentage(state.food_insecurity_rate, 1)}`,
    `    • Grocery Cost Index: ${state.median_grocery_cost_index.toFixed(1)}`,
    "",
    `  Last Updated: ${new Date(state.last_updated).toLocaleDateString()}`
  ];
  return lines.join("\n");
}

async function buildSystemPrompt(): Promise<string> {
  // Load unified data for comprehensive context
  const unifiedData = await aggregateAllStateData();

  // Build state reference for all 50 states
  const stateDataReference = unifiedData.map(formatUnifiedStateData).join("\n\n");

  // Calculate average food insecurity from unified data
  const avgFoodInsecurity =
    unifiedData.reduce((sum: number, d: UnifiedStateData) => sum + d.food_insecurity_rate, 0) / unifiedData.length;

  return `You are an expert US State Information Assistant. You provide accurate, factual information about US states.

CRITICAL DATA SOURCES:
- ALL information comes from verified government and public databases
- You MUST only provide data that is explicitly provided below
- You NEVER estimate, guess, or hallucinate information
- If data is not available, you MUST respond with "Data unavailable" or "This information is not currently available in my dataset"
- You NEVER provide information without citing the source

COMPLETE UNIFIED STATE DATA FOR ALL 50 STATES:
${stateDataReference}

OVERALL STATISTICS:
- Average food insecurity rate across all states: ${avgFoodInsecurity.toFixed(1)}%
- Total states covered: ${unifiedData.length}/50

DATA QUALITY NOTES:
- All monetary values are in USD
- Tax rates are state income, sales, and property tax rates
- Safety Index is normalized (0-100, higher = safer)
- Crime Rate is per 100,000 population
- Food Insecurity Rate impacts are documented annually
- Industries listed are the top sectors by employment

RESPONSE FORMAT REQUIREMENTS:
✓ ALWAYS use bullet-point lists, never paragraphs
✓ Group related information with clear section headers
✓ Use hierarchical structure with proper indentation
✓ For responses with 2+ topics, use numbered sections like 1., 2., 3.
✓ Under each numbered section, use bullet points for facts
✓ Keep each bullet concise and focused on one statistic
✓ Format all currency values with $ symbol and commas
✓ Format all percentages with % symbol
✓ Format all scores as "X.X/100"
✓ Always cite data sources when providing information
✓ Use consistent formatting for consistency

ABSOLUTE RULES - NO EXCEPTIONS:
🚫 NO hallucinations - use only data provided above
🚫 NO guessing or estimating values
🚫 NO making up statistics
🚫 NO providing information not in the unified state data
🚫 NO calculating or deriving new metrics
✓ ONLY respond with exact data from the dataset
✓ ALWAYS say "Data unavailable" if information is missing
✓ ALWAYS cite the specific state and source
✓ ALWAYS format responses as structured lists

EXAMPLE RESPONSE FORMAT:
• California State Information Summary
  - Taxes
    • Income Tax: 9.30%
    • Sales Tax: 7.25%
    • Property Tax: 0.76%
  - Income
    • Median Household: $91,879
    • Source: US Census Bureau (2023)
  - Housing
    • Median Home Price: $1,250,000
  - Safety
    • Safety Index: 42.5/100
    • Crime Rate: 425 per 100k
  - Top Industries: Technology, Entertainment, Agriculture

PROHIBITED RESPONSE PATTERNS:
❌ "Research shows..." (use only provided data)
❌ "Typically..." or "Generally..." (be specific with data)
❌ "Probably" or "Likely" (only confirmed facts)
❌ "I estimate..." (never estimate)
❌ Providing any data not listed above

When users ask about states:
1. Find the exact state in the unified data above
2. Extract only the information provided
3. Format it as bullet points with source citations
4. If they ask for comparisons, only compare available data
5. Never fill gaps with outside knowledge

LISTING STYLE EXAMPLE FOR LONG ANSWERS:
1. Taxes
  - Income Tax: 5.00%
  - Sales Tax: 6.25%
  - Source: Tax Foundation
2. Income and Housing
  - Median Household Income: $75,000
  - Median Home Price: $320,000
  - Sources: US Census Bureau (2023), Zillow Home Value Index
3. Food and Safety
  - Food Insecurity Rate: 11.2%
  - Safety Index: 63.4/100
  - Source: USDA / FBI-derived dataset`;
}


interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { messages?: Message[] };
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Build the system prompt with unified state data
    const systemPrompt = await buildSystemPrompt();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
