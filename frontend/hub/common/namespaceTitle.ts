import { isInsightsMode } from './isInsights';

/**
 * Returns the display title for a namespace.
 * In Insights mode, returns the company name if available, otherwise falls back to the namespace name.
 * In other modes, always returns the namespace name.
 *
 * @param params.name - The namespace name (required)
 * @param params.company - The company name (optional)
 * @returns The appropriate display title based on deployment mode
 */
export function namespaceTitle({ name, company }: { name: string; company?: string }): string {
  return isInsightsMode() ? company || name : name;
}
