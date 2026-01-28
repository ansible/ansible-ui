import { Page } from '@playwright/test';
import { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';
import { platformUI } from './login';

// Re-export constants for convenience
export { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';

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
 * Checks the build type by first checking the platformUI URL pattern (no auth needed),
 * then trying the API for TOWER_URL_BASE (requires page to be logged in),
 * and falling back to localhost detection.
 *
 * @param page - The Playwright Page object (must be logged in for API call to work)
 * @returns Promise<string> - Returns the build type URL or empty string
 */
export async function checkBuildType(page: Page): Promise<string> {
  // First, check if platformUI itself contains known build type patterns (no auth needed)
  const platformBuildType = getBuildTypeFromUrl(platformUI);
  if (platformBuildType) {
    return platformBuildType;
  }

  // Second, try to get the build type from the API (uses page.request which shares auth cookies)
  try {
    const response = await page.request.get(`${platformUI}/api/controller/v2/settings/system/`);

    if (response.ok()) {
      const data = (await response.json()) as Settings;
      const baseUrl = data.TOWER_URL_BASE;
      const buildType = getBuildTypeFromUrl(baseUrl);
      if (buildType) {
        return buildType;
      }
    }
  } catch {
    // API call failed, continue to fallback
  }

  // Fallback: check if platformUI is localhost - this indicates AAP dev environment
  // (e.g., ephemeral AAP deployments use localhost:4100 as the UI endpoint)
  if (isLocalhostUrl(platformUI)) {
    return AAP_DEV_LOCALHOST_URL;
  }

  return '';
}
