// API helper functions for platform tests
export function awxAPI(path: string) {
  return '/api/controller/v2' + path;
}

export function hubAPI(path: string) {
  return '/api/galaxy' + path;
}

export function edaAPI(path: string) {
  return '/api/eda/v1' + path;
}

// Type definitions for API responses
export interface AwxConfig {
  version: string;
  [key: string]: unknown;
}

export interface HubConfig {
  galaxy_ng_version: string;
  [key: string]: unknown;
}

export interface EdaConfig {
  version: string;
  [key: string]: unknown;
}
