import { Page } from '@playwright/test';
import { AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';
import { platformUI } from './login';

// Re-export constants for convenience
// Note: AAP_DEV_LOCALHOST_URL is exported for backwards compatibility but checkBuildType()
// no longer returns it because we can't reliably distinguish dev localhost from RPM builds
export { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';

interface Settings {
  TOWER_URL_BASE: string;
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
 * then trying the API for TOWER_URL_BASE (requires page to be logged in).
 *
 * Only returns a value for known cloud deployments (SAAS, AZURE, OCP).
 * Returns empty string for RPM, containerized, and local dev builds.
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

  // No known build type detected - return empty string
  // Note: We intentionally don't detect localhost as AAP_DEV_LOCALHOST because
  // RPM/containerized builds also use localhost when PLATFORM_UI is not set
  return '';
}
