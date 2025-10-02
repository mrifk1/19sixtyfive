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

const createContentSecurityPolicy = (nonce: string) =>
  [
    "default-src 'self'",
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://wp.19sixtyfive.com.sg",
    "font-src 'self' data:",
    "connect-src 'self' https://wp.19sixtyfive.com.sg",
    "media-src 'self' https://wp.19sixtyfive.com.sg",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

export function middleware(request: NextRequest) {
  const start = Date.now();
  const nonce = globalThis.crypto.randomUUID().replace(/-/g, "");
  const requestId =
    request.headers.get("x-request-id") ?? globalThis.crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const responseHeaders = response.headers;
  responseHeaders.set("x-request-id", requestId);
  responseHeaders.set("Content-Security-Policy", createContentSecurityPolicy(nonce));
  responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  responseHeaders.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  if (process.env.NODE_ENV !== "production") {
    const pathname = request.nextUrl.pathname;
    if (!shouldBypass(pathname)) {
      responseHeaders.set("X-Robots-Tag", "noindex, nofollow, noarchive");
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
