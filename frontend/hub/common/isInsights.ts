import { IPageAction, PageActionSelection } from '@ansible/ansible-ui-framework';

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

/**
 * Filter out bulk (multi-select) toolbar actions in Insights mode.
 * Bulk operations are not supported in the Insights deployment.
 */
export function filterInsightsBulkActions<T extends object>(
  actions: IPageAction<T>[]
): IPageAction<T>[] {
  if (!isInsightsMode()) return actions;
  return actions.filter(
    (action) => !('selection' in action) || action.selection !== PageActionSelection.Multiple
  );
}
