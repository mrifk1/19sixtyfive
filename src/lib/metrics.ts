type MetricsEntry = {
  name: string;
  labels?: Record<string, string>;
};

type ExtendedGlobal = typeof globalThis & {
  __metricsStore?: Map<string, number>;
};

const globalMetrics = globalThis as ExtendedGlobal;

if (!globalMetrics.__metricsStore) {
  globalMetrics.__metricsStore = new Map();
}

const store = globalMetrics.__metricsStore;

function serializeMetric(entry: MetricsEntry): string {
  if (!entry.labels || Object.keys(entry.labels).length === 0) {
    return entry.name;
  }
  const labelPairs = Object.entries(entry.labels)
    .map(([key, value]) => `${key}="${String(value).replace(/"/g, '\"')}"`)
    .join(",");
  return `${entry.name}{${labelPairs}}`;
}

export function incrementMetric(entry: MetricsEntry, value = 1) {
  const key = serializeMetric(entry);
  const current = store.get(key) ?? 0;
  store.set(key, current + value);
}

export function collectMetrics(): string {
  return Array.from(store.entries())
    .map(([key, value]) => `${key} ${value}`)
    .join("\n");
}
