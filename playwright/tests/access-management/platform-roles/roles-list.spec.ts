import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createRole, deleteRole } from './roles-utils';

test.beforeEach(setupBefore({ path: '/access/roles' }));
test.afterEach(setupAfter);

test.describe('Roles', () => {
  test(
    'Admin user can create new custom Role, verify component and permissions on the details page, then delete the role',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const roleName = await createRole(page, 'namespace');
      await deleteRole(roleName, page);
    }
  );
});
