export function getOptionalServerEnvVar(
  name: string,
  fallback?: string
): string | undefined {
  const value = process.env[name]?.trim();
  return value || fallback;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sanitizeUrl(input: string, name: string): string {
  try {
    const url = new URL(input);
    if (!/^https?:$/.test(url.protocol)) {
      throw new Error(`${name} must use http or https`);
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error(`Invalid URL provided for ${name}: ${(error as Error).message}`);
  }
}

export function sanitizePathInput(path: string): string {
  const trimmed = path?.trim?.() ?? "";
  if (!trimmed) {
    throw new Error("Path cannot be empty");
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (normalized.includes("..")) {
    throw new Error("Path cannot traverse directories");
  }
  if (!/^\/[A-Za-z0-9/_\-]*(\?[A-Za-z0-9._~=&%\-]*)?$/.test(normalized)) {
    throw new Error("Path contains invalid characters");
  }
  return normalized;
}

export function sanitizeTagInput(tag: string): string {
  const trimmed = tag?.trim?.() ?? "";
  if (!trimmed) {
    throw new Error("Tag cannot be empty");
  }
  if (!/^[A-Za-z0-9:_\-]+$/.test(trimmed)) {
    throw new Error("Tag contains invalid characters");
  }
  return trimmed;
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  const cip = request.headers.get("cf-connecting-ip")?.trim();
  if (cip) return cip;
  return (request as unknown as { ip?: string }).ip ?? "unknown";
}
