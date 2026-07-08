import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3015";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${DASHBOARD_URL}/api/analytics/replay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { ok: false, mode: "provider-unavailable" },
      { status: 503 },
    );
  }
}
