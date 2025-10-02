type RateLimitEntry = {
  count: number;
  reset: number;
};

type ExtendedGlobal = typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>;
};

const globalRateLimit = globalThis as ExtendedGlobal;

if (!globalRateLimit.__rateLimitStore) {
  globalRateLimit.__rateLimitStore = new Map();
}

const store = globalRateLimit.__rateLimitStore;

export type RateLimitOptions = {
  identifier: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export function consumeRateLimit(
  options: RateLimitOptions
): RateLimitResult {
  const { identifier, limit, windowMs } = options;
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.reset <= now) {
    const entry: RateLimitEntry = { count: 1, reset: now + windowMs };
    store.set(identifier, entry);
    return {
      success: true,
      remaining: Math.max(limit - 1, 0),
      reset: entry.reset,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.reset,
    };
  }

  existing.count += 1;
  store.set(identifier, existing);

  return {
    success: true,
    remaining: Math.max(limit - existing.count, 0),
    reset: existing.reset,
  };
}
