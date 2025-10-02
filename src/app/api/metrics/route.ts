import { NextResponse } from "next/server";
import { getClientIdentifier } from "@/lib/env";
import { collectMetrics, incrementMetric } from "@/lib/metrics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const client = getClientIdentifier(request);
  incrementMetric({ name: "http_requests_total", labels: { client } });

  return new NextResponse(collectMetrics(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4",
      "Cache-Control": "no-store",
    },
  });
}
