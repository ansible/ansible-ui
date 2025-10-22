import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { deleteResourceFromList } from '@ansible/playwright/commands/deleteResourceFromList';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createOrganization, deleteOrganization } from '../organizations/organization-utils';
import { createTeam, deleteTeam, editTeam, editTeamFromList } from './team-utils';

test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

test.describe('Platform Teams CRUD', () => {
  test('create team and verify it exists', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const teamName = await createTeam({ organizationName }, page);

    try {
      await expect(page.getByRole('heading', { name: teamName, exact: true })).toBeVisible();
    } finally {
      await deleteTeam(teamName, page);
      await deleteOrganization(organizationName, page);
    }
  });

  test('edit team from list view', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const originalTeamName = await createTeam({ organizationName }, page);
    const editedTeamName = `edited-${originalTeamName}`;

    try {
      await editTeamFromList(originalTeamName, editedTeamName, page);
    } finally {
      try {
        await deleteTeam(editedTeamName, page);
      } catch {
        await deleteTeam(originalTeamName, page);
      }
      await deleteOrganization(organizationName, page);
    }
  });

  test('edit team from details page', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const originalTeamName = await createTeam({ organizationName }, page);
    const editedTeamName = `edited-${originalTeamName}`;

    try {
      await editTeam(originalTeamName, editedTeamName, page);
      await expect(page.getByRole('heading', { name: editedTeamName, exact: true })).toBeVisible();
    } finally {
      try {
        await deleteTeam(editedTeamName, page);
      } catch {
        await deleteTeam(originalTeamName, page);
      }
      await deleteOrganization(organizationName, page);
    }
  });

  test('delete team from list view', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const teamName = await createTeam({ organizationName }, page);

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
      await deleteOrganization(organizationName, page);
    }
  });

  test('delete team from details page', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const teamName = await createTeam({ organizationName }, page);

    try {
      await deleteTeam(teamName, page);

      await expect(page).toHaveURL(/\/teams/);
      await clearTableFilters(page);
      await expect(page.getByRole('row', { name: teamName })).not.toBeVisible();
    } finally {
      await deleteOrganization(organizationName, page);
    }
  });

  test('bulk delete teams from toolbar action', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const team1Name = await createTeam({ organizationName }, page);
    const team2Name = await createTeam({ organizationName }, page);

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
      await deleteOrganization(organizationName, page);
    }
  });
});
