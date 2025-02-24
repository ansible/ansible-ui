import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createTeam, deleteTeam } from './team-utils';
import { assertNoResultsFoundForResource } from '../../../commands/assertNoResultsFoundForResource';

test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

test('team - create and delete', { tag: ['@team'] }, async ({ page }) => {
  const teamName = await createTeam({}, page);
  await deleteTeam(teamName, page);
  await assertNoResultsFoundForResource(teamName, 'contains', page, true);
});
