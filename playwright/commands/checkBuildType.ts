import { APIRequestContext } from '@playwright/test';
import { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';
import { platformUI } from './login';

interface Settings {
  TOWER_URL_BASE: string;
}

/**
 * Helper function to check if a URL is a localhost URL (AAP dev environment)
 */
function isLocalhostUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '::1'
    );
  } catch {
    // If URL parsing fails, fall back to string matching
    return (
      url.includes('localhost:') ||
      url.includes('127.0.0.1:') ||
      url.includes('localhost/') ||
      url.includes('127.0.0.1/')
    );
  }
}

/**
 * Helper function to determine build type from a URL string
 */
function getBuildTypeFromUrl(url: string): string {
  const parseSaas = url.includes(SAAS_URL);
  const parseOcpA = url.includes(OCP_A_URL);
  const parseAzure = url.includes(AZURE_URL);

  if (parseSaas) {
    return SAAS_URL;
  }
  if (parseOcpA) {
    return OCP_A_URL;
  }
  if (parseAzure) {
    return AZURE_URL;
  }
  return '';
}

/**
 * Checks the build type by first trying to get it from the API,
 * then checking if platformUI is localhost (AAP dev environment).
 *
 * @param request - The Playwright API request context
 * @returns Promise<string> - Returns the build type URL or empty string
 */
export async function checkBuildType(request: APIRequestContext): Promise<string> {
  // First, check if platformUI is localhost - this indicates AAP dev environment
  // (e.g., ephemeral AAP deployments use localhost:4100 as the UI endpoint)
  if (isLocalhostUrl(platformUI)) {
    return AAP_DEV_LOCALHOST_URL;
  }

  // Second, try to get the build type from the API
  const response = await request.get(`${platformUI}/api/v2/settings/system/`);

  if (response.ok()) {
    const data = (await response.json()) as Settings;
    const baseUrl = data.TOWER_URL_BASE;
    const buildType = getBuildTypeFromUrl(baseUrl);
    if (buildType) {
      return buildType;
    }
  }

  return '';
}
