import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getAssetsPath } from "@/config/api";

export const runtime = "nodejs";

const CACHE_MAX_AGE = 86400;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join("/");
    
    const backendUrl = `${getBackendUrl()}${getAssetsPath()}/${filePath}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "",
      },
      next: { revalidate: CACHE_MAX_AGE },
    });

    if (!response.ok) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, immutable`,
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
