const isProduction = process.env.NODE_ENV === "production";

export const API_CONFIG = {
  backend: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:8082",
    apiPath: process.env.API_PATH || "/custom/v1",
  },
  assets: {
    path: process.env.ASSETS_PATH || "/wp-content/uploads",
  },
  cache: {
    defaultRevalidate: isProduction ? 3600 : 0,
    defaultCache: isProduction ? "force-cache" : "no-store",
  },
} as const;

export function getBackendUrl(): string {
  return API_CONFIG.backend.baseUrl;
}

export function getApiPath(): string {
  return API_CONFIG.backend.apiPath;
}

export function getAssetsPath(): string {
  return API_CONFIG.assets.path;
}

export function isProductionMode(): boolean {
  return isProduction;
}
