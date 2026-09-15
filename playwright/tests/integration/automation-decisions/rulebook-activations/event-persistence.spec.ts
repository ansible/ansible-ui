import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaOrganization,
  EdaProject,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.describe('Rulebook Activations - Event Persistence', () => {
  test.describe.configure({ timeout: 180000 });

  let organizationName: string;
  let projectName: string;
  let credentialName: string;
  let ruleEngineCredentialName: string;
  let decisionEnvironmentName: string;

  test.beforeEach(async ({ page }) => {
    const organization = await Organization.api.create(page);
    organizationName = organization.name;
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

    const project = await EdaProject.api.create(page, { organization: edaOrganization.id });
    await EdaProject.api.waitForSync(page, project.id);
    projectName = project.name;

    const credential = await EdaCredential.api.create(page, {
      name: createE2EName('credential'),
      organizationId: edaOrganization.id,
      credentialTypeName: 'Red Hat Ansible Automation Platform',
      inputs: {
        host: 'https://1.1.1.1/',
        username: 'test',
        password: 'test',
      },
    });
    credentialName = credential.name;

    const decisionEnvironment = await DecisionEnvironment.api.create(page, {
      organizationId: edaOrganization.id,
    });
    decisionEnvironmentName = decisionEnvironment.name;

    const ruleEngineCredential = await EdaCredential.api.create(page, {
      name: createE2EName('rule-engine-credential'),
      organizationId: edaOrganization.id,
      credentialTypeName: 'Event-Driven Ansible Rule Engine',
      inputs: {
        postgres_db_host: 'localhost',
        postgres_db_name: 'test_db',
      },
    });
    ruleEngineCredentialName = ruleEngineCredential.name;
  });

  test.afterEach(async ({ page }) => {
    if (decisionEnvironmentName) {
      await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
    }
    if (ruleEngineCredentialName) {
      await EdaCredential.api.deleteByName(page, ruleEngineCredentialName);
    }
    if (credentialName) {
      await EdaCredential.api.deleteByName(page, credentialName);
    }
    if (projectName) {
      await EdaProject.api.deleteByName(page, projectName);
    }
    if (organizationName) {
      await Organization.api.deleteByName(page, organizationName);
    }
  });

  test(
    'should create rulebook activation with event persistence and rule engine credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      // Fill in basic form fields
      const activationName = `E2E Event Persistence ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

      // Select organization
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      // Select project
      await page.getByRole('button', { name: 'Project' }).click();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await page.getByRole('option', { name: projectName }).click();

      // Select rulebook
      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      // Select decision environment
      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(decisionEnvironmentName);
      await page.getByRole('option', { name: decisionEnvironmentName }).click();

      // Disable the activation so create does not immediately provision workers/persistence
      const activationEnabledSwitch = page.getByRole('switch', {
        name: /Rulebook activation enabled/i,
      });
      await expect(activationEnabledSwitch).toBeVisible();
      await activationEnabledSwitch.click();

      // Enable event persistence
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(persistenceCheckbox).toBeVisible();
      await persistenceCheckbox.check();

      // Verify that event persistence credential field appears
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      // Select the rule engine credential (required when no default system credential exists)
      await page.getByRole('button', { name: /Event persistence credential/i }).click();
      const credentialSearch = page.locator('#rule-engine-credential-select-search input');
      await expect(credentialSearch).toBeVisible();
      await credentialSearch.fill(ruleEngineCredentialName);
      await page.getByRole('option', { name: ruleEngineCredentialName }).click();

      // Create the activation
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/activations/') && response.request().method() === 'POST'
      );
      await page.getByRole('button', { name: 'Create rulebook activation' }).click();
      const createResponse = await createResponsePromise;
      expect(createResponse.ok()).toBeTruthy();

      // Verify details page shows persistence enabled
      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible({
        timeout: 10000,
      });

      // Check that persistence is enabled on details page
      await expect(page.getByTestId('enable-persistence')).toBeVisible();

      // Verify the rule engine credential is displayed
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

      // Clean up
      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should edit rulebook activation to enable event persistence',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      // Create activation without persistence first
      const activationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
        disabled: true,
      });

      // Verify persistence is disabled by default (element should not exist)
      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();

      // Navigate to edit page
      await page.getByRole('button', { name: 'Edit rulebook activation' }).click();

      // Enable event persistence
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(persistenceCheckbox).toBeVisible();
      await persistenceCheckbox.check();

      // Verify credential field appears
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      // Select a rule engine credential
      await page.getByRole('button', { name: /Event persistence credential/i }).click();
      const credentialSearch = page.locator('#rule-engine-credential-select-search input');
      await expect(credentialSearch).toBeVisible();
      await credentialSearch.fill(ruleEngineCredentialName);
      await page.getByRole('option', { name: ruleEngineCredentialName }).click();

      // Save changes
      await page.getByRole('button', { name: 'Save rulebook activation' }).click();

      // Verify changes on details page
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

      // Clean up
      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should disable event persistence and clear credential selection',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = `E2E Disable Persistence ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

      // Fill in required fields
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Project' }).click();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await page.getByRole('option', { name: projectName }).click();

      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(decisionEnvironmentName);
      await page.getByRole('option', { name: decisionEnvironmentName }).click();

      // Enable persistence
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await persistenceCheckbox.check();

      // Verify credential field is visible
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      // Select a rule engine credential
      await page.getByRole('button', { name: /Event persistence credential/i }).click();
      const credentialSearch = page.locator('#rule-engine-credential-select-search input');
      await expect(credentialSearch).toBeVisible();
      await credentialSearch.fill(ruleEngineCredentialName);
      await page.getByRole('option', { name: ruleEngineCredentialName }).click();

      // Verify credential chip is displayed
      await expect(page.getByText(ruleEngineCredentialName)).toBeVisible();

      // Disable persistence
      await persistenceCheckbox.uncheck();

      // Verify credential field is hidden
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      // Verify credential chip is also hidden/removed
      // (The credential selection should be cleared when persistence is disabled)
      await expect(page.getByText(ruleEngineCredentialName)).not.toBeVisible();

      // Re-enable persistence to verify field appears empty
      await persistenceCheckbox.check();
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      // Verify the previously selected credential was cleared
      // The credential chip should not reappear
      await expect(page.getByText(ruleEngineCredentialName)).not.toBeVisible();
    }
  );

  // Skipped: AAP installs a hidden default rule engine credential (_DEFAULT_EDA_RULE_ENGINE_CREDS)
  // that is filtered from API responses (eda-server eda_credential.py). Because this credential
  // always exists at install time, enabling persistence without selecting a credential never
  // produces an error — the backend silently uses the default. The test's expected error cannot
  // be triggered unless the instance is built without a managed DB. Behavior is in flux (UXD
  // discussions tracked under AAP-77521). Re-evaluate when default credential visibility changes.
  test.skip(
    'should show error when persistence enabled without credential and no default exists',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = `E2E No Default Credential ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

      // Fill in required fields
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Project' }).click();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await page.getByRole('option', { name: projectName }).click();

      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(decisionEnvironmentName);
      await page.getByRole('option', { name: decisionEnvironmentName }).click();

      // Enable persistence WITHOUT selecting a credential
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await persistenceCheckbox.check();

      // Verify credential field appears
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      // Submit without selecting a credential - should show error when no default exists
      await page.getByRole('button', { name: 'Create rulebook activation' }).click();

      // Verify error message appears
      await expect(page.getByText(/no default EDA Rule Engine credential found/i)).toBeVisible();

      // Verify we're still on the create page (submission failed)
      await expect(page.getByRole('heading', { name: 'Create rulebook activation' })).toBeVisible();
    }
  );

  test(
    'should allow submission when persistence is disabled without credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = `E2E No Persistence ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

      // Fill in required fields
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Project' }).click();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await page.getByRole('option', { name: projectName }).click();

      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(decisionEnvironmentName);
      await page.getByRole('option', { name: decisionEnvironmentName }).click();

      // Do NOT enable persistence
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(persistenceCheckbox).not.toBeChecked();

      // Credential field should not be visible
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      // Submit - should succeed without credential
      await page.getByRole('button', { name: 'Create rulebook activation' }).click();

      // Verify we're on the details page
      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();

      // Verify persistence is disabled (element should not exist)
      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();

      // Clean up
      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should nullify credential when editing to disable persistence after credential was selected',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(300000);

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = `E2E Edit Disable Persistence ${Date.now()}`;
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

      // Fill in required fields
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Project' }).click();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await page.getByRole('option', { name: projectName }).click();

      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(decisionEnvironmentName);
      await page.getByRole('option', { name: decisionEnvironmentName }).click();

      // Disable the activation before creating it so we can edit it later
      const activationEnabledSwitch = page.getByRole('switch', {
        name: /Rulebook activation enabled/i,
      });
      await expect(activationEnabledSwitch).toBeVisible();
      await activationEnabledSwitch.click();

      // Enable persistence and select a credential
      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await persistenceCheckbox.check();

      await page.getByRole('button', { name: /Event persistence credential/i }).click();
      const credentialSearch = page.locator('#rule-engine-credential-select-search input');
      await expect(credentialSearch).toBeVisible();
      await credentialSearch.fill(ruleEngineCredentialName);
      await page.getByRole('option', { name: ruleEngineCredentialName }).click();

      // Create the activation
      await page.getByRole('button', { name: 'Create rulebook activation' }).click();

      // Verify it was created with persistence and credential
      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

      // Edit the activation
      await page.getByRole('button', { name: 'Edit rulebook activation' }).click();

      // Disable persistence WITHOUT manually clearing the credential
      const editPersistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(editPersistenceCheckbox).toBeChecked();
      await editPersistenceCheckbox.uncheck();

      // Verify credential field is hidden
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      // Save the changes
      await page.getByRole('button', { name: 'Save rulebook activation' }).click();

      // Wait for navigation back to details page
      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible({
        timeout: 10000,
      });

      // Verify persistence is disabled and credential is null
      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();

      // Credential should not be visible (cleared when persistence was disabled)
      await expect(page.getByTestId('rule-engine-credential')).not.toBeVisible();

      // Clean up
      await RulebookActivation.ui.delete(page, activationName);
    }
  );
});
