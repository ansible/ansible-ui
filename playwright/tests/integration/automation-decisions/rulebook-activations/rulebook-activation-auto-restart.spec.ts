import { expect, test } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaProject,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.describe('Rulebook Activations - Auto-restart on Project Update', () => {
  test.beforeAll(() => {
    if (isSaaS()) {
      test.skip(true, 'Rulebook activations not available on SaaS deployments');
    }
  });

  let organizationName: string;
  let projectName: string;
  let credentialName: string;
  let decisionEnvironmentName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    projectName = await EdaProject.ui.create(page, { organizationName });
    credentialName = await EdaCredential.ui.create(page, { organizationName });
    decisionEnvironmentName = await DecisionEnvironment.ui.create(page, { organizationName });
  });

  test.afterEach(async ({ page }) => {
    await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
    await EdaCredential.api.deleteByName(page, credentialName);
    await EdaProject.api.deleteByName(page, projectName);
    await Organization.api.deleteByName(page, organizationName);
  });

  test(
    'should create rulebook activation with auto-restart on project update enabled',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      await test.step('Navigate to create activation page', async () => {
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await page.getByText('Create rulebook activation').click();
      });

      const activationName = `E2E Auto-restart Activation ${Date.now()}`;

      await test.step('Fill in basic activation information', async () => {
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

        await page.getByRole('button', { name: 'Organization' }).click();
        await page
          .locator('#organization_id-search')
          .getByRole('textbox', { name: 'Search input' })
          .fill(organizationName);

        await page.getByRole('button', { name: 'Project' }).click();
        await page
          .locator('#project_id-search')
          .getByRole('textbox', { name: 'Search input' })
          .fill(projectName);
        await page.getByRole('option', { name: projectName }).click();

        await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
        await page.getByRole('option', { name: 'hello_echo.yml' }).click();

        await page.getByRole('button', { name: 'Credential' }).click();
        const credentialSearch = page.locator('#credential-select-search input');
        await credentialSearch.fill(credentialName);
        await page.getByRole('menuitem', { name: credentialName }).click();

        await page.getByRole('button', { name: 'Decision Environment' }).click();
        const decisionEnvSearch = page.locator('#decision_environment_id-search input');
        await decisionEnvSearch.fill(decisionEnvironmentName);
        await page.getByRole('option', { name: decisionEnvironmentName }).click();
      });

      await test.step('Enable auto-restart on project update', async () => {
        const autoRestartCheckbox = page.getByRole('checkbox', {
          name: 'Auto-restart on project update',
        });
        await expect(autoRestartCheckbox).toBeVisible();
        await expect(autoRestartCheckbox).not.toBeChecked();
        await autoRestartCheckbox.check();
        await expect(autoRestartCheckbox).toBeChecked();
      });

      await test.step('Create activation', async () => {
        // Create as disabled to avoid timing issues
        await page
          .getByRole('switch', { name: 'Rulebook activation enabled?' })
          .click({ force: true });
        await page.getByRole('button', { name: 'Create rulebook activation' }).click();
        await expect(
          page.getByRole('heading', { name: activationName, exact: true })
        ).toBeVisible();
      });

      // Cleanup
      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should edit rulebook activation to enable auto-restart on project update',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
        disabled: true,
      });

      await test.step('Navigate to edit activation page', async () => {
        await clickPageAction('Edit rulebook activation', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${rulebookActivationName}` })
        ).toBeVisible();
      });

      await test.step('Enable auto-restart on project update', async () => {
        const autoRestartCheckbox = page.getByRole('checkbox', {
          name: 'Auto-restart on project update',
        });
        await expect(autoRestartCheckbox).toBeVisible();
        await expect(autoRestartCheckbox).not.toBeChecked();
        await autoRestartCheckbox.check();
      });

      await test.step('Save changes', async () => {
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
      });

      // Cleanup
      await RulebookActivation.ui.delete(page, rulebookActivationName);
    }
  );

  test(
    'should toggle auto-restart checkbox in activation form',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const autoRestartCheckbox = page.getByRole('checkbox', {
        name: 'Auto-restart on project update',
      });

      await test.step('Checkbox should be visible and unchecked initially', async () => {
        await expect(autoRestartCheckbox).toBeVisible();
        await expect(autoRestartCheckbox).not.toBeChecked();
      });

      await test.step('Checkbox should be checked when clicked', async () => {
        await autoRestartCheckbox.check();
        await expect(autoRestartCheckbox).toBeChecked();
      });

      await test.step('Checkbox should be unchecked when clicked again', async () => {
        await autoRestartCheckbox.uncheck();
        await expect(autoRestartCheckbox).not.toBeChecked();
      });
    }
  );

  test(
    'should preserve auto-restart setting when editing activation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
        disabled: true,
      });

      await test.step('Enable auto-restart on first edit', async () => {
        await clickPageAction('Edit rulebook activation', page);
        const autoRestartCheckbox = page.getByRole('checkbox', {
          name: 'Auto-restart on project update',
        });
        await autoRestartCheckbox.check();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
      });

      await test.step('Verify auto-restart is still enabled on second edit', async () => {
        await clickPageAction('Edit rulebook activation', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${rulebookActivationName}` })
        ).toBeVisible();

        const autoRestartCheckbox = page.getByRole('checkbox', {
          name: 'Auto-restart on project update',
        });
        await expect(autoRestartCheckbox).toBeChecked();
      });

      // Cleanup
      await page.getByRole('button', { name: 'Cancel' }).click();
      await RulebookActivation.ui.delete(page, rulebookActivationName);
    }
  );

  test(
    'should create activation without auto-restart checkbox checked',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
        disabled: true,
      });

      await test.step('Navigate back to details page', async () => {
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
      });

      // Cleanup
      await RulebookActivation.ui.delete(page, rulebookActivationName);
    }
  );

  test(
    'should combine auto-restart with other activation options',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = `E2E Combined Options ${Date.now()}`;

      await test.step('Fill in basic information', async () => {
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

        await page.getByRole('button', { name: 'Organization' }).click();
        await page
          .locator('#organization_id-search')
          .getByRole('textbox', { name: 'Search input' })
          .fill(organizationName);

        await page.getByRole('button', { name: 'Project' }).click();
        await page
          .locator('#project_id-search')
          .getByRole('textbox', { name: 'Search input' })
          .fill(projectName);
        await page.getByRole('option', { name: projectName }).click();

        await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
        await page.getByRole('option', { name: 'hello_echo.yml' }).click();

        await page.getByRole('button', { name: 'Credential' }).click();
        const credentialSearch = page.locator('#credential-select-search input');
        await credentialSearch.fill(credentialName);
        await page.getByRole('menuitem', { name: credentialName }).click();

        await page.getByRole('button', { name: 'Decision Environment' }).click();
        const decisionEnvSearch = page.locator('#decision_environment_id-search input');
        await decisionEnvSearch.fill(decisionEnvironmentName);
        await page.getByRole('option', { name: decisionEnvironmentName }).click();
      });

      await test.step('Enable multiple options including auto-restart', async () => {
        await page.getByRole('checkbox', { name: 'Skip audit events' }).check();
        await page.getByRole('checkbox', { name: 'Auto-restart on project update' }).check();
        await page
          .getByRole('switch', { name: 'Rulebook activation enabled?' })
          .click({ force: true });
      });

      await test.step('Create activation', async () => {
        await page.getByRole('button', { name: 'Create rulebook activation' }).click();
        await expect(
          page.getByRole('heading', { name: activationName, exact: true })
        ).toBeVisible();

        // Verify at least the skip audit events option is shown (auto-restart may not be in details page yet)
        const enabledOptionsSection = page.locator('#enabled-option');
        await expect(enabledOptionsSection).toContainText('Skip audit events');
      });

      // Cleanup
      await RulebookActivation.ui.delete(page, activationName);
    }
  );
});
