import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildId = process.env.NEXT_BUILD_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";

export async function GET() {
  const requestHeaders = await headers();
  const region = requestHeaders.get("x-vercel-ip-country") ?? "unknown";

  const body = {
    ok: true,
    buildId,
    region,
    timestamp: new Date().toISOString(),
  } as const;

  return NextResponse.json(body, {
    status: body.ok ? 200 : 500,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
