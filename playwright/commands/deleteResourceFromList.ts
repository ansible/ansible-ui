import { Page } from '@playwright/test';
import { clickTableRow } from './clickTableRow';
import { clickPageAction } from './clickPageAction';
import { confirmAndAssertDeletion } from './confirmAndAssertDeletion';
import { navigateTo } from './navigateTo';

export interface DeleteResourceOptions {
  resourceName: string;
  resourceType: string; // e.g., 'user', 'team', 'organization'
  filterLabel?: string; // e.g., 'Username', 'Name'
  navigationPath: [string, string]; // e.g., ['Access Management', 'Users']
}

/**
 * Generic function to delete a single resource from its list view
 * Follows the established pattern: navigate → filter → click row → delete action → confirm
 */
export async function deleteResourceFromList(options: DeleteResourceOptions, page: Page) {
  const { resourceName, resourceType, filterLabel = 'Name', navigationPath } = options;

  await navigateTo(page, navigationPath[0], navigationPath[1]);
  await clickTableRow({ filterLabel, text: resourceName }, page);
  await clickPageAction(`Delete ${resourceType}`, page);
  await confirmAndAssertDeletion(page);
}
