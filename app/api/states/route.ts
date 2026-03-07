import { NextResponse } from "next/server";

import { loadDataset } from "@/lib/loadDataset";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(): Promise<NextResponse> {
  const data = await loadDataset();
  return NextResponse.json(data, { headers: CORS_HEADERS });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
