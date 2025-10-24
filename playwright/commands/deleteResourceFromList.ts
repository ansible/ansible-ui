import { Page } from '@playwright/test';
import { clickPageAction } from './clickPageAction';
import { clickTableRow } from './clickTableRow';
import { confirmAndAssertDeletion } from './confirmAndAssertDeletion';
import { navigateTo } from './navigateTo';

export interface DeleteResourceOptions {
  resourceName: string;
  resourceType: string; // e.g., 'user', 'team', 'credential type'
  filterLabel?: string; // e.g., 'Username', 'Name'
  navigationPath: string[]; // e.g., ['Access Management', 'Users'] or ['Automation Execution', 'Infrastructure', 'Credential Types']
}

/**
 * Generic function to delete a single resource from its list view (via details page)
 * Follows the established pattern: navigate → filter → click row → delete action → confirm
 * Supports variable-length navigation paths (2-level, 3-level, etc.)
 */
export async function deleteResourceFromList(options: DeleteResourceOptions, page: Page) {
  const { resourceName, resourceType, filterLabel = 'Name', navigationPath } = options;

  await navigateTo(page, ...navigationPath);
  await clickTableRow({ filterLabel, text: resourceName }, page);
  await clickPageAction(`Delete ${resourceType}`, page);
  await confirmAndAssertDeletion(page);
}
