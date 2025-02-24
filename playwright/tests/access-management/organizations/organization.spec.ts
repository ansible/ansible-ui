import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';
import { assertNoResultsFoundForResource } from '../../../commands/assertNoResultsFoundForResource';
import { clickBreadcrumbLink } from '../../../commands/clickBreadcrumbLink';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', { tag: ['@not_mock'] }, async ({ page }) => {
  const organizationName = await createOrganization(page);
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await clickBreadcrumbLink('Organizations', page);
  await deleteOrganization(organizationName, page);
  await assertNoResultsFoundForResource(organizationName, 'contains', page, true);
});
