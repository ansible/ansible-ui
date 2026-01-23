/**
 * Check if we're running in Insights mode (console.redhat.com)
 *
 * In Insights mode, some features behave differently:
 * - URL query string management is disabled to avoid path conflicts with Chrome's router
 * - Chrome shell provides the navigation sidebar
 *
 * Note: webpack DefinePlugin replaces process.env.IS_INSIGHTS with the literal value.
 * We cast to unknown to check for both boolean true and string 'true'.
 */
export function isInsightsMode(): boolean {
  const value = process.env.IS_INSIGHTS as unknown;
  return value === true || value === 'true';
}
