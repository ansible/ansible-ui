import { expect, test } from '@playwright/test';
import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization, Team, User } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Gateway domain persistence', () => {
  test(
    'inherits organization and team domains while isolating user domains',
    { tag: ['@not_mock', '@tier2'] },
    async ({ page }) => {
      const suffix = Date.now();
      const password = 'TestPassword123!';
      const userAUsername = `aaprfe_domains_a_${suffix}`;
      const userBUsername = `aaprfe_domains_b_${suffix}`;
      let currentUsername = process.env.PLATFORM_USERNAME!;
      let organization: Awaited<ReturnType<typeof Organization.api.create>> | undefined;
      let team: Awaited<ReturnType<typeof Team.api.create>> | undefined;
      let userA: Awaited<ReturnType<typeof User.api.create>> | undefined;
      let userB: Awaited<ReturnType<typeof User.api.create>> | undefined;

      try {
        organization = await Organization.api.create(page, {
          name: `AAP-RFE Domains ${suffix}`,
        });
        team = await Team.api.create(page, {
          name: `AAP-RFE Domain Team ${suffix}`,
          organization: organization.id,
        });
        userA = await User.api.create(page, { username: userAUsername, password });
        userB = await User.api.create(page, { username: userBUsername, password });

        await Organization.api.addUser(page, organization.id, { userId: userA.id });
        await Organization.api.addUser(page, organization.id, { userId: userB.id });
        await Team.api.associateUsers(page, team.id, [userA.id, userB.id]);

        await gatewayAPI.put(page, `organizations/${organization.id}/domains/`, {
          domains: [
            { name: 'Shared', labels: [{ name: 'organization' }] },
            { name: 'Organization only', labels: [] },
          ],
        });
        await gatewayAPI.put(page, `teams/${team.id}/domains/`, {
          domains: [
            { name: 'Shared', labels: [{ name: 'team' }] },
            { name: 'Team only', labels: [] },
          ],
        });

        await logout(page, { username: currentUsername });
        await login(page, platformUI, { username: userAUsername, password });
        currentUsername = userAUsername;

        const userAInherited = await gatewayAPI.get<{
          value: { domains: { name: string }[]; userDomains: { name: string }[] };
        }>(page, 'me/preferences/domains/');
        expect(userAInherited?.value.domains).toEqual([
          { name: 'Shared', labels: [{ name: 'team' }] },
          { name: 'Organization only', labels: [] },
          { name: 'Team only', labels: [] },
        ]);
        expect(userAInherited?.value.userDomains).toEqual([]);

        await gatewayAPI.put(page, 'me/preferences/domains/', {
          value: {
            domains: [{ name: 'User only', labels: [] }],
            activeDomains: [{ name: 'User only', labels: [] }],
          },
        });

        await logout(page, { username: currentUsername });
        await login(page, platformUI, { username: userBUsername, password });
        currentUsername = userBUsername;

        const userBPreference = await gatewayAPI.get<{
          value: { domains: { name: string }[]; userDomains: { name: string }[] };
        }>(page, 'me/preferences/domains/');
        expect(userBPreference?.value.domains.map((domain) => domain.name)).toEqual([
          'Shared',
          'Organization only',
          'Team only',
        ]);
        expect(userBPreference?.value.userDomains).toEqual([]);

        await logout(page, { username: currentUsername });
        await login(page, platformUI, { username: userAUsername, password });
        currentUsername = userAUsername;
        const userAAfterRelogin = await gatewayAPI.get<{
          value: { domains: { name: string }[]; activeDomains: { name: string }[] };
        }>(page, 'me/preferences/domains/');
        expect(userAAfterRelogin?.value.domains.map((domain) => domain.name)).toContain(
          'User only'
        );
        expect(userAAfterRelogin?.value.activeDomains).toEqual([{ name: 'User only', labels: [] }]);
      } finally {
        await logout(page, { username: currentUsername }).catch(() => undefined);
        await login(page, platformUI).catch(() => undefined);
        if (team) await Team.api.delete(page, team.id).catch(() => undefined);
        if (organization)
          await Organization.api.delete(page, organization.id).catch(() => undefined);
        if (userA) await User.api.delete(page, userA.id).catch(() => undefined);
        if (userB) await User.api.delete(page, userB.id).catch(() => undefined);
      }
    }
  );
});
