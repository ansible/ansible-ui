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
  dismissOpenSelectMenus,
  setRulebookActivationEnabledSwitch,
} from '@ansible/playwright/utils';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

async function fillCreateActivationBasics(
  page: Page,
  {
    activationName,
    organizationName,
    projectName,
    decisionEnvironmentName,
  }: {
    activationName: string;
    organizationName: string;
    projectName: string;
    decisionEnvironmentName: string;
  }
) {
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(activationName);

  await page.getByRole('button', { name: 'Organization' }).click();
  await page
    .locator('#organization_id-search')
    .getByRole('textbox', { name: 'Search input' })
    .fill(organizationName);
  const organizationOption = page.getByRole('option', { name: organizationName });
  await expect(organizationOption).toBeVisible();
  await organizationOption.click();

  await page.getByRole('button', { name: 'Project' }).click();
  await page
    .locator('#project_id-search')
    .getByRole('textbox', { name: 'Search input' })
    .fill(projectName);
  const projectOption = page.getByRole('option', { name: projectName });
  await expect(projectOption).toBeVisible();
  await projectOption.click();

  await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
  await page.getByRole('option', { name: 'hello_echo.yml' }).click();

  await page.getByRole('button', { name: 'Decision Environment' }).click();
  const decisionEnvSearch = page.locator('#decision_environment_id-search input');
  await expect(decisionEnvSearch).toBeVisible();
  await decisionEnvSearch.fill(decisionEnvironmentName);
  const decisionEnvOption = page.getByRole('option', { name: decisionEnvironmentName });
  await expect(decisionEnvOption).toBeVisible();
  await decisionEnvOption.click();
  await dismissOpenSelectMenus(page);
}

async function enableEventPersistence(page: Page) {
  const persistenceCheckbox = page.getByRole('checkbox', {
    name: /Enable event persistence/i,
  });
  await expect(persistenceCheckbox).toBeVisible();
  await persistenceCheckbox.check();
  await expect(page.getByRole('button', { name: /Event persistence credential/i })).toBeVisible();
  // Keep the auto-selected managed credential. A fixture with localhost
  // postgres inputs makes create/update return 500.
  await expect(page.getByTestId('rule-engine-credential-select')).not.toContainText(
    'Select an event persistence credential',
    { timeout: 15000 }
  );
}

async function submitActivation(
  page: Page,
  {
    buttonName,
    method,
  }: {
    buttonName: 'Create rulebook activation' | 'Save rulebook activation';
    method: 'POST' | 'PATCH';
  }
) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/activations/') &&
      response.request().method() === method &&
      !response.url().includes('/disable/') &&
      !response.url().includes('/enable/')
  );
  await page.getByRole('button', { name: buttonName }).click();
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(
      `${method} activations failed with ${response.status()}: ${await response.text()}`
    );
  }
}

test.describe('Rulebook Activations - Event Persistence', () => {
  test.describe.configure({ timeout: 300000 });

  let organizationName: string;
  let projectName: string;
  let credentialName: string;
  let ruleEngineCredentialName: string;
  let decisionEnvironmentName: string;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000);

    const organization = await Organization.api.create(page);
    organizationName = organization.name;
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error(`Platform organization "${organization.name}" missing ansible_id`);
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

    const project = await EdaProject.api.create(page, { organization: edaOrganization.id });
    await EdaProject.api.waitForSync(page, project.id);
    projectName = project.name;

    const credential = await EdaCredential.api.create(page, {
      name: createE2EName('credential'),
      organizationId: edaOrganization.id,
      credentialTypeName: 'Red Hat Ansible Automation Platform',
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
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = createE2EName('event-persistence');
      await fillCreateActivationBasics(page, {
        activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      await setRulebookActivationEnabledSwitch(page, false);
      await enableEventPersistence(page);

      await submitActivation(page, {
        buttonName: 'Create rulebook activation',
        method: 'POST',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toBeVisible();

      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should edit rulebook activation to enable event persistence',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const activationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
        disabled: true,
      });

      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();

      await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
      await enableEventPersistence(page);

      await submitActivation(page, {
        buttonName: 'Save rulebook activation',
        method: 'PATCH',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toBeVisible();

      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should disable event persistence and clear credential selection',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = createE2EName('disable-persistence');
      await fillCreateActivationBasics(page, {
        activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await persistenceCheckbox.check();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      await page.getByRole('button', { name: /Event persistence credential/i }).click();
      const credentialSearch = page.locator('#rule-engine-credential-select-search input');
      await expect(credentialSearch).toBeVisible();
      await credentialSearch.fill(ruleEngineCredentialName);
      await page.getByRole('option', { name: ruleEngineCredentialName }).click();
      await dismissOpenSelectMenus(page);

      await expect(page.getByText(ruleEngineCredentialName)).toBeVisible();

      await persistenceCheckbox.uncheck();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();
      await expect(page.getByText(ruleEngineCredentialName)).not.toBeVisible();

      await persistenceCheckbox.check();
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();
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
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = createE2EName('no-default-credential');
      await fillCreateActivationBasics(page, {
        activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await persistenceCheckbox.check();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();

      await page.getByRole('button', { name: 'Create rulebook activation' }).click();

      await expect(page.getByText(/no default EDA Rule Engine credential found/i)).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Create rulebook activation' })).toBeVisible();
    }
  );

  test(
    'should allow submission when persistence is disabled without credential',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = createE2EName('no-persistence');
      await fillCreateActivationBasics(page, {
        activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      await setRulebookActivationEnabledSwitch(page, false);

      const persistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(persistenceCheckbox).not.toBeChecked();
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      await submitActivation(page, {
        buttonName: 'Create rulebook activation',
        method: 'POST',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();

      await RulebookActivation.ui.delete(page, activationName);
    }
  );

  test(
    'should nullify credential when editing to disable persistence after credential was selected',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();

      const activationName = createE2EName('edit-disable-persistence');
      await fillCreateActivationBasics(page, {
        activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      await setRulebookActivationEnabledSwitch(page, false);
      await enableEventPersistence(page);

      await submitActivation(page, {
        buttonName: 'Create rulebook activation',
        method: 'POST',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toBeVisible();

      await page.getByRole('button', { name: 'Edit rulebook activation' }).click();

      const editPersistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(editPersistenceCheckbox).toBeChecked();
      await editPersistenceCheckbox.uncheck();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      await submitActivation(page, {
        buttonName: 'Save rulebook activation',
        method: 'PATCH',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).not.toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).not.toBeVisible();

      await RulebookActivation.ui.delete(page, activationName);
    }
  );
});
