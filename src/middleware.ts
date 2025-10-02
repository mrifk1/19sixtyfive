import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const shouldBypass = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api") ||
  pathname.startsWith("/images/") ||
  pathname.endsWith(".xml") ||
  pathname.endsWith(".txt") ||
  pathname.endsWith(".json") ||
  pathname.endsWith(".svg") ||
  pathname.endsWith(".ico") ||
  pathname.startsWith("/videos/");

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId =
    request.headers.get("x-request-id") ?? globalThis.crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  if (process.env.NODE_ENV !== "production") {
    const pathname = request.nextUrl.pathname;
    if (!shouldBypass(pathname)) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
  }

  const duration = Date.now() - start;
  const logPayload = {
    level: "info" as const,
    requestId,
    method: request.method,
    pathname: request.nextUrl.pathname,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(logPayload));

  return response;
}

export const config = {
  matcher: ["/(.*)"],
};
