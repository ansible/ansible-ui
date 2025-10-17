import { APIRequestContext } from '@playwright/test';
import { AZURE_URL, OCP_A_URL, SAAS_URL } from './constants';
import { platformUI } from './login';

interface Settings {
  TOWER_URL_BASE: string;
}

/**
 * Helper function to determine build type from a URL string
 */
function getBuildTypeFromUrl(url: string): string {
  const parseAzure = url.includes(AZURE_URL);
  const parseSaas = url.includes(SAAS_URL);
  const parseOcpA = url.includes(OCP_A_URL);

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
 * Checks the build type by first trying to get it from the API (like Cypress does),
 * and falling back to URL-based detection if the API call fails.
 *
 * @param request - The Playwright API request context
 * @returns Promise<string> - Returns the build type URL or empty string
 */
export async function checkBuildType(request: APIRequestContext): Promise<string> {
  // First, try to get the build type from the API (like Cypress does)
  const response = await request.get(`${platformUI}/api/v2/settings/system/`);

  if (response.ok()) {
    const data = (await response.json()) as Settings;
    const baseUrl = data.TOWER_URL_BASE;
    const buildType = getBuildTypeFromUrl(baseUrl);
    if (buildType) {
      return buildType;
    }
  }

  // Fallback: Check the platform UI URL directly
  return getBuildTypeFromUrl(platformUI);
}
