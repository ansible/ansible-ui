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
  fillRulebookActivationCreateForm,
  setRulebookActivationEnabledSwitch,
  submitRulebookActivationForm,
} from '@ansible/playwright/utils';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

async function enableEventPersistence(page: Page, credentialName: string) {
  const persistenceCheckbox = page.getByRole('checkbox', {
    name: /Enable event persistence/i,
  });
  await expect(persistenceCheckbox).toBeVisible();
  await persistenceCheckbox.check();

  const credentialToggle = page.getByTestId('rule-engine-credential-select');
  await expect(credentialToggle).toBeVisible();

  await page.getByRole('button', { name: /Event persistence credential/i }).click();
  const credentialSearch = page.locator('#rule-engine-credential-select-search input');
  await expect(credentialSearch).toBeVisible();
  await credentialSearch.fill(credentialName);
  await page.getByRole('option', { name: credentialName, exact: true }).click();
  await dismissOpenSelectMenus(page);

  await expect(credentialToggle).toContainText(credentialName);
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
      await fillRulebookActivationCreateForm(page, {
        name: activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      await setRulebookActivationEnabledSwitch(page, false);
      await enableEventPersistence(page, ruleEngineCredentialName);

      await submitRulebookActivationForm(page, {
        buttonName: 'Create rulebook activation',
        method: 'POST',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

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
      await enableEventPersistence(page, ruleEngineCredentialName);

      await submitRulebookActivationForm(page, {
        buttonName: 'Save rulebook activation',
        method: 'PATCH',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

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
      await fillRulebookActivationCreateForm(page, {
        name: activationName,
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
      await page.getByRole('option', { name: ruleEngineCredentialName, exact: true }).click();
      await dismissOpenSelectMenus(page);

      await expect(page.getByTestId('rule-engine-credential-select')).toContainText(
        ruleEngineCredentialName
      );

      await persistenceCheckbox.uncheck();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();
      await expect(page.getByTestId('rule-engine-credential-select')).not.toBeVisible();

      await persistenceCheckbox.check();
      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential-select')).not.toContainText(
        ruleEngineCredentialName
      );
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
      await fillRulebookActivationCreateForm(page, {
        name: activationName,
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
      await fillRulebookActivationCreateForm(page, {
        name: activationName,
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

      await submitRulebookActivationForm(page, {
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
      await fillRulebookActivationCreateForm(page, {
        name: activationName,
        organizationName,
        projectName,
        decisionEnvironmentName,
      });

      await setRulebookActivationEnabledSwitch(page, false);
      await enableEventPersistence(page, ruleEngineCredentialName);

      await submitRulebookActivationForm(page, {
        buttonName: 'Create rulebook activation',
        method: 'POST',
      });

      await expect(page.getByRole('heading', { name: activationName, exact: true })).toBeVisible();
      await expect(page.getByTestId('enable-persistence')).toBeVisible();
      await expect(page.getByTestId('rule-engine-credential')).toHaveText(ruleEngineCredentialName);

      await page.getByRole('button', { name: 'Edit rulebook activation' }).click();

      const editPersistenceCheckbox = page.getByRole('checkbox', {
        name: /Enable event persistence/i,
      });
      await expect(editPersistenceCheckbox).toBeChecked();
      await editPersistenceCheckbox.uncheck();

      await expect(
        page.getByRole('button', { name: /Event persistence credential/i })
      ).not.toBeVisible();

      await submitRulebookActivationForm(page, {
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
