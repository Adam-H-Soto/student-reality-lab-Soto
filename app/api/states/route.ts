import { NextRequest, NextResponse } from "next/server";
import { aggregateAllStateData, getSingleStateData, getCacheStatus } from "@/lib/stateDataAggregator";
import { loadDataset } from "@/lib/loadDataset";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

/**
 * GET /api/states
 * Returns all state data or a specific state if ?state=StateName is provided
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const stateName = searchParams.get("state");
    const includeCache = searchParams.get("cache") === "true";
    const view = searchParams.get("view");

    // Legacy chart data contract for original visualization pages.
    if (view === "food") {
      const foodRows = await loadDataset();
      return NextResponse.json(foodRows, {
        headers: CORS_HEADERS,
      });
    }

    // If specific state requested
    if (stateName) {
      const stateData = await getSingleStateData(stateName);
      
      if (!stateData) {
        return NextResponse.json(
          { error: `State not found: ${stateName}` },
          { status: 404, headers: CORS_HEADERS }
        );
      }

      const response: { data: typeof stateData; cache_status?: ReturnType<typeof getCacheStatus> } = { data: stateData };
      if (includeCache) {
        response.cache_status = getCacheStatus();
      }

      return NextResponse.json(response, {
        headers: CORS_HEADERS
      });
    }

    // Return all states
    const allStates = await aggregateAllStateData();
    
    const response: { data: typeof allStates; count: number; timestamp: string; cache_status?: ReturnType<typeof getCacheStatus> } = {
      data: allStates,
      count: allStates.length,
      timestamp: new Date().toISOString()
    };

    if (includeCache) {
      response.cache_status = getCacheStatus();
    }

    return NextResponse.json(response, {
      headers: CORS_HEADERS
    });
  } catch (error) {
    console.error("Error in /api/states:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch state data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/states?action=refresh
 * Manually refresh the cache
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "refresh") {
      // Refresh cache
      const { refreshAggregationCache } = await import("@/lib/stateDataAggregator");
      const refreshed = await refreshAggregationCache();

      return NextResponse.json({
        success: true,
        message: "Cache refreshed successfully",
        data_points: refreshed.length,
        timestamp: new Date().toISOString()
      }, {
        headers: CORS_HEADERS
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in POST /api/states:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
