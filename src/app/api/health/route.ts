import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRequiredServerEnvVar } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildId = process.env.NEXT_BUILD_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";

const requiredEnv = ["API_BASE_URL", "API_KEY", "REVALIDATE_SECRET"] as const;

export async function GET() {
  const requestHeaders = await headers();
  const region = requestHeaders.get("x-vercel-ip-country") ?? "unknown";

  const missing = requiredEnv.filter((key) => {
    try {
      getRequiredServerEnvVar(key);
      return false;
    } catch {
      return true;
    }
  });

  const body = {
    ok: missing.length === 0,
    buildId,
    region,
    timestamp: new Date().toISOString(),
    env: {
      ok: missing.length === 0,
      missing,
    },
  } as const;

  return NextResponse.json(body, {
    status: body.ok ? 200 : 500,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
