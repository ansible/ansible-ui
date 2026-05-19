import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { deleteResourceFromList } from '@ansible/playwright/commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization, Team } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

test.describe('Platform Teams CRUD', () => {
  test('create team and verify it exists', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const teamName = await Team.ui.create(page, { organizationName });

    try {
      await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
    } finally {
      await Team.ui.delete(page, teamName);
      await Organization.ui.delete(page, organizationName);
    }
  });

  test('edit team from list view', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const originalTeamName = await Team.ui.create(page, { organizationName });
    const editedTeamName = `edited-${originalTeamName}`;

    try {
      await Team.ui.editFromList(page, originalTeamName, editedTeamName);
    } finally {
      try {
        await Team.ui.delete(page, editedTeamName);
      } catch {
        await Team.ui.delete(page, originalTeamName);
      }
      await Organization.ui.delete(page, organizationName);
    }
  });

  // Shifted left: Redundant UI path - edit already covered via list view
  test('edit team from details page', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const originalTeamName = await Team.ui.create(page, { organizationName });
    const editedTeamName = `edited-${originalTeamName}`;

    try {
      await Team.ui.edit(page, originalTeamName, editedTeamName);
      await expect(page.getByRole('heading', { name: editedTeamName, exact: true })).toBeVisible();
    } finally {
      try {
        await Team.ui.delete(page, editedTeamName);
      } catch {
        await Team.ui.delete(page, originalTeamName);
      }
      await Organization.ui.delete(page, organizationName);
    }
  });

  test('delete team from list view', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const teamName = await Team.ui.create(page, { organizationName });

    try {
      await deleteResourceFromList(
        {
          resourceName: teamName,
          resourceType: 'team',
          filterLabel: 'Name',
          navigationPath: ['Access Management', 'Teams'],
        },
        page
      );

      await clearTableFilters(page);
      await expect(page.getByRole('row', { name: teamName })).not.toBeVisible();
    } finally {
      await Organization.ui.delete(page, organizationName);
    }
  });

  // Shifted left: Redundant UI path - delete already covered via list view
  test('delete team from details page', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const teamName = await Team.ui.create(page, { organizationName });

    try {
      await Team.ui.delete(page, teamName);

      await expect(page).toHaveURL(/\/teams/);
      await clearTableFilters(page);
      await expect(page.getByRole('row', { name: teamName })).not.toBeVisible();
    } finally {
      await Organization.ui.delete(page, organizationName);
    }
  });

  // Shifted left: Bulk operation - convenience feature, not core functionality
  test('bulk delete teams from toolbar action', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await Organization.ui.create(page);
    const team1Name = await Team.ui.create(page, { organizationName });
    const team2Name = await Team.ui.create(page, { organizationName });

    try {
      await bulkDeleteResources(
        {
          resourceType: 'teams',
          resourceNames: [team1Name, team2Name],
          filterLabel: 'Name',
          navigationPath: ['Access Management', 'Teams'],
        },
        page
      );

      await clearTableFilters(page);
      await expect(page.getByRole('row', { name: team1Name })).not.toBeVisible();
      await expect(page.getByRole('row', { name: team2Name })).not.toBeVisible();
    } finally {
      await Organization.ui.delete(page, organizationName);
    }
  });
});
