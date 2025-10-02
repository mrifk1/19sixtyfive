import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  getClientIdentifier,
  getOptionalServerEnvVar,
  getRequiredServerEnvVar,
  sanitizePathInput,
  sanitizeTagInput,
} from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const secret = getRequiredServerEnvVar("REVALIDATE_SECRET");
const RATE_LIMIT_WINDOW_MS = Math.max(
  Number(getOptionalServerEnvVar("REVALIDATE_WINDOW_MS", "60000")) || 60000,
  1000
);
const RATE_LIMIT_MAX = Math.max(
  Number(getOptionalServerEnvVar("REVALIDATE_MAX_REQUESTS", "30")) || 30,
  1
);

type Payload = {
  path?: string;
  tag?: string;
  type?: "path" | "tag";
  token?: string;
};

function json(
  data: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function unauthorized() {
  return json({ revalidated: false, message: "Invalid token" }, 401);
}

function enforceRateLimit(
  request: Request
): NextResponse | { remaining: number; reset: number } {
  const identifier = getClientIdentifier(request);
  const { success, reset, remaining } = consumeRateLimit({
    identifier,
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!success) {
    const retryAfter = Math.max(Math.ceil((reset - Date.now()) / 1000), 1);
    return json(
      {
        revalidated: false,
        message: "Too many requests",
      },
      429,
      {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
      }
    );
  }

  return {
    remaining,
    reset,
  };
}

async function parsePayload(request: Request): Promise<Payload> {
  try {
    const body = (await request.json()) as Payload;
    return body ?? {};
  } catch {
    return {};
  }
}

function sanitizePayload(payload: Payload) {
  const normalized: Payload = {};
  if (typeof payload.path === "string") {
    normalized.path = sanitizePathInput(payload.path);
  }
  if (typeof payload.tag === "string") {
    normalized.tag = sanitizeTagInput(payload.tag);
  }
  if (payload.type === "tag" || payload.type === "path") {
    normalized.type = payload.type;
  }
  if (typeof payload.token === "string") {
    normalized.token = payload.token.trim();
  }
  return normalized;
}

export async function POST(request: Request) {
  const rateLimitResult = enforceRateLimit(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const url = new URL(request.url);
  const payload = sanitizePayload(await parsePayload(request));
  const providedSecret = url.searchParams.get("secret") ?? payload.token;

  if (providedSecret !== secret) {
    return unauthorized();
  }

  const targetType = payload.type ?? (payload.tag ? "tag" : "path");

  try {
    if (targetType === "tag" && payload.tag) {
      revalidateTag(payload.tag);
    } else if (payload.path) {
      revalidatePath(payload.path);
    } else {
      return json({ revalidated: false, message: "Provide path or tag" }, 400);
    }

    return json({ revalidated: true, type: targetType }, 200, {
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    });
  } catch (error) {
    return json(
      { revalidated: false, message: (error as Error).message },
      500
    );
  }
}

export async function GET(request: Request) {
  const rateLimitResult = enforceRateLimit(request);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");

  if (providedSecret !== secret) {
    return unauthorized();
  }

  const tagParam = url.searchParams.get("tag");
  const pathParam = url.searchParams.get("path");

  try {
    if (tagParam) {
      const tag = sanitizeTagInput(tagParam);
      revalidateTag(tag);
      return json(
        { revalidated: true, type: "tag" },
        200,
        {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        }
      );
    }

    if (pathParam) {
      const path = sanitizePathInput(pathParam);
      revalidatePath(path);
      return json(
        { revalidated: true, type: "path" },
        200,
        {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        }
      );
    }
  } catch (error) {
    return json(
      { revalidated: false, message: (error as Error).message },
      400
    );
  }

  return json({ revalidated: false, message: "Provide path or tag" }, 400);
}
