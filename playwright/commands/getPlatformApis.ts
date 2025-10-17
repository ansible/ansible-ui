import { APIRequestContext } from '@playwright/test';
import { platformUI } from './login';

export interface PlatformApis {
  apis: {
    gateway?: string;
    controller?: string;
    eda?: string;
    galaxy?: string;
  };
}

/**
 * Gets the platform APIs configuration from the platform server.
 * This is the Playwright equivalent of Cypress's cy.getPlatformApis().
 *
 * @param request - Playwright API request context
 * @returns Promise<PlatformApis> - The platform APIs configuration
 */
export async function getPlatformApis(request: APIRequestContext): Promise<PlatformApis> {
  const response = await request.get(`${platformUI}/api/`);

  if (!response.ok()) {
    throw new Error(`Failed to get platform APIs: ${response.status()} ${response.statusText()}`);
  }

  return (await response.json()) as PlatformApis;
}

/**
 * Checks if a specific API is available in the platform configuration.
 *
 * @param request - Playwright API request context
 * @param apiName - The API name to check ('gateway', 'controller', 'eda', 'galaxy')
 * @returns Promise<boolean> - True if the API is available
 */
export async function isApiAvailable(
  request: APIRequestContext,
  apiName: keyof PlatformApis['apis']
): Promise<boolean> {
  const platformApis = await getPlatformApis(request);
  return !!platformApis?.apis?.[apiName];
}

/**
 * Checks if EDA API is available in the platform configuration.
 * This is commonly used to skip EDA-related tests when EDA is not available.
 *
 * @param request - Playwright API request context
 * @returns Promise<boolean> - True if EDA API is available
 */
export async function isEdaAvailable(request: APIRequestContext): Promise<boolean> {
  return await isApiAvailable(request, 'eda');
}
