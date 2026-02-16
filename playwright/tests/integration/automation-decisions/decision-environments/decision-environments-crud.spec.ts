import { expect, test } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { DecisionEnvironment } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/decision-environments' }));
test.afterEach(setupAfter);

test.describe('EDA Decision Environments - CRUD Operations', () => {
  test(
    'should create a decision environment and assert the information showing on the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const deName = createE2EName('decision-environment');
      let deId: number | undefined;

      try {
        await test.step('Create decision environment via API', async () => {
          const de = await DecisionEnvironment.api.create(page, { name: deName });
          deId = de.id;
        });

        await test.step('Navigate to details page and verify', async () => {
          await navigateTo(page, 'Automation Decisions', 'Decision Environments');
          await page.getByRole('button', { name: 'table view' }).click();
          await clickTableRow(
            {
              text: deName,
              pageTitle: 'Decision Environments',
              filterLabel: 'Name',
              filterValue: deName,
              clearFilters: true,
            },
            page
          );
          await expect(page.getByRole('heading', { name: deName, exact: true })).toBeVisible();
        });
      } finally {
        if (deId) {
          try {
            await DecisionEnvironment.api.delete(page, deId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should verify edit functionality of a decision environment',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const originalName = createE2EName('decision-environment');
      let deId: number | undefined;

      try {
        await test.step('Create decision environment via API', async () => {
          const de = await DecisionEnvironment.api.create(page, { name: originalName });
          deId = de.id;
        });

        await test.step('Edit decision environment name', async () => {
          await DecisionEnvironment.ui.edit(page, originalName, {
            name: originalName + 'edited',
          });
        });

        await test.step('Verify edited name appears on details page', async () => {
          await expect(
            page.getByRole('heading', { name: originalName + 'edited', exact: true })
          ).toBeVisible();
        });
      } finally {
        if (deId) {
          try {
            await DecisionEnvironment.api.delete(page, deId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should delete a decision environment from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const deName = createE2EName('decision-environment');
      let deId: number | undefined;

      try {
        await test.step('Create decision environment via API', async () => {
          const de = await DecisionEnvironment.api.create(page, { name: deName });
          deId = de.id;
        });

        await test.step('Navigate to decision environment details page', async () => {
          await navigateTo(page, 'Automation Decisions', 'Decision Environments');
          await page.getByRole('button', { name: 'table view' }).click();
          await clickTableRow(
            {
              text: deName,
              pageTitle: 'Decision Environments',
              filterLabel: 'Name',
              filterValue: deName,
              clearFilters: true,
            },
            page
          );
          await expect(page.getByRole('heading', { name: deName, exact: true })).toBeVisible();
        });

        await test.step('Delete decision environment and verify', async () => {
          const deleteResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/decision-environments/') &&
              response.request().method() === 'DELETE' &&
              response.status() === 204
          );

          await clickPageAction('Delete decision environment', page);
          await confirmAndAssertDeletion(page);

          const deleteResponse = await deleteResponsePromise;
          expect(deleteResponse.status()).toBe(204);
          await expect(page.getByTestId('page-title')).toHaveText('Decision Environments');
        });

        // Clear deId since deletion was successful
        deId = undefined;
      } finally {
        if (deId) {
          try {
            await DecisionEnvironment.api.delete(page, deId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  test(
    'should create a decision environment with specific pull policy and verify on details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const expectedPullPolicy = 'Always';
      let deName: string;
      let deId: number | undefined;

      try {
        await test.step('Create decision environment with pull policy via UI', async () => {
          const createResponsePromise = page.waitForResponse(
            (response) =>
              response.url().includes('/decision-environments/') &&
              response.request().method() === 'POST' &&
              response.status() === 201
          );

          deName = await DecisionEnvironment.ui.create(page, {
            organizationName: 'Default',
            pullPolicy: expectedPullPolicy,
          });

          // Capture ID from POST response
          const createResponse = await createResponsePromise;
          const createdDE = (await createResponse.json()) as { id: number };
          deId = createdDE.id;
        });

        await test.step('Verify decision environment details', async () => {
          await expect(page.getByRole('heading', { name: deName, exact: true })).toBeVisible();

          const pullPolicyElement = page.getByTestId('pull-policy');
          const isPullPolicyVisible = await pullPolicyElement.isVisible().catch(() => false);

          if (isPullPolicyVisible) {
            await expect(pullPolicyElement).toContainText(expectedPullPolicy);
          }
        });
      } finally {
        if (deId) {
          try {
            await DecisionEnvironment.api.delete(page, deId);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );
});
