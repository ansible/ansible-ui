import type { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import type { EdaProject as EdaProjectType } from '@ansible/eda-ui/interfaces/EdaProject';
import type { EdaResult } from '@ansible/eda-ui/interfaces/EdaResult';
import type { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import type { ActivationRead } from '@ansible/eda-ui/interfaces/generated/eda-api';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { edaAPI, gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { RulebookActivation } from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.describe('EDA Credentials Usage in Resources', { tag: ['@not_mock'] }, () => {
  let organizationName: string;
  let platformOrgId: number;
  let edaOrgId: number;
  let edaProject: EdaProjectType;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRulebook: EdaRulebook;

  test.beforeEach(async ({ page }) => {
    organizationName = createE2EName('organization');
    const platformOrg = await gatewayAPI.post<PlatformOrganization>(page, 'organizations/', {
      name: organizationName,
      description: 'Created for E2E testing',
    });

    if (!platformOrg) {
      throw new Error('Failed to create platform organization');
    }

    platformOrgId = platformOrg.id;

    // Get the corresponding EDA organization
    const ansibleId = platformOrg.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);
    edaOrgId = edaOrganization.id;

    const projectName = createE2EName('project');
    edaProject = (await edaAPI.post(page, 'projects/', {
      name: projectName,
      organization_id: edaOrgId,
      url: 'https://github.com/ansible/ansible-ui',
    })) as EdaProjectType;

    await waitForProjectSync(page, edaProject);

    const rulebooksResult = (await edaAPI.get(page, 'rulebooks/', {
      params: { project_id: edaProject.id, name: 'hello_echo.yml' },
    })) as EdaResult<EdaRulebook>;

    if (!rulebooksResult?.results || rulebooksResult.results.length === 0) {
      throw new Error('No rulebooks found for project');
    }

    edaRulebook = rulebooksResult.results[0];

    const deName = createE2EName('decision-environment');
    edaDecisionEnvironment = (await edaAPI.post(page, 'decision-environments/', {
      name: deName,
      organization_id: edaOrgId,
      image_url: 'quay.io/ansible/ansible-rulebook:main',
    })) as EdaDecisionEnvironment;
  });

  test.afterEach(async ({ page }) => {
    if (edaProject?.id) {
      await edaAPI.delete(page, `projects/${edaProject.id}/`).catch(() => {});
    }
    if (edaDecisionEnvironment?.id) {
      await edaAPI
        .delete(page, `decision-environments/${edaDecisionEnvironment.id}/?force=true`)
        .catch(() => {});
    }
    if (platformOrgId) {
      await gatewayAPI.delete(page, `organizations/${platformOrgId}/`).catch(() => {});
    }
  });

  test('should create RBA without credentials', async ({ page }) => {
    test.setTimeout(180000);

    const rbaName = createE2EName('rulebook-activation');

    await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
    await page.getByText('Create rulebook activation').click();
    await expect(page.getByRole('heading', { name: 'Create rulebook activation' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(rbaName);
    await page
      .getByRole('textbox', { name: 'Description', exact: true })
      .fill('This is a new rulebook activation.');

    await page.getByRole('button', { name: 'Organization' }).click();
    await page.locator('#organization_id-search').getByRole('textbox').fill(organizationName);
    await page.getByRole('option', { name: organizationName }).click();

    await page.getByRole('button', { name: 'Project' }).click();
    await page.locator('#project_id-search').getByRole('textbox').fill(edaProject.name);
    await page.getByRole('option', { name: edaProject.name }).click();

    await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
    await page.getByRole('option', { name: edaRulebook.name }).click();

    await page.getByRole('button', { name: 'Decision Environment' }).click();
    await page.locator('#decision_environment_id-search input').fill(edaDecisionEnvironment.name);
    await page.getByRole('option', { name: edaDecisionEnvironment.name }).click();

    await page.getByRole('button', { name: 'On failure' }).click();
    await page.getByRole('option', { name: 'Always' }).click();

    const createResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/eda/v1/activations/') && response.status() === 201
    );

    await page.getByRole('button', { name: 'Create rulebook activation', exact: true }).click();

    const createResponse = await createResponsePromise;
    const createdRBA = (await createResponse.json()) as ActivationRead;

    try {
      await expect(page.getByRole('heading', { name: rbaName, exact: true })).toBeVisible();

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(createdRBA.name);
      await page.getByRole('button', { name: 'apply filter' }).click();

      await page
        .getByRole('row', { name: createdRBA.name })
        .getByLabel('kebab dropdown toggle')
        .click();
      await page.getByRole('menuitem', { name: 'Restart rulebook activation' }).click();

      await expect(
        page.getByRole('dialog', { name: 'Restart rulebook activations' })
      ).toBeVisible();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();

      await page.getByRole('button', { name: 'Restart rulebook activations' }).click();

      await expect(page.getByRole('dialog')).toContainText('Success', { timeout: 15000 });
      await page.getByRole('button', { name: 'Close' }).click();
    } finally {
      if (createdRBA?.id) {
        await edaAPI.delete(page, `activations/${createdRBA.id}/`).catch(() => {});
      }
    }
  });

  test('should not create a private project without credentials', async ({ page }) => {
    test.setTimeout(180000);

    const projectName = createE2EName('project');

    await navigateTo(page, 'Automation Decisions', 'Projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(projectName);
    await page.getByLabel('Source Control URL').fill('https://github.com/ansible/aap-ui');

    await page.getByRole('button', { name: 'Organization' }).click();
    await page.locator('#organization_id-search').getByRole('textbox').fill(organizationName);
    await page.getByRole('option', { name: organizationName }).click();

    const createResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/eda/v1/projects/') && response.status() === 201
    );

    await page.getByRole('button', { name: 'Create project', exact: true }).click();

    const createResponse = await createResponsePromise;
    const newProject = (await createResponse.json()) as EdaProjectType;

    try {
      const syncedProject = await waitForProjectSync(page, newProject);

      await expect(page.getByTestId('status')).toContainText('Failed', { timeout: 30000 });
      await expect(page.getByTestId('import-error')).toContainText(
        'Credentials not provided or incorrect'
      );
      expect(syncedProject.import_state).toBe('failed');
    } finally {
      if (newProject?.id) {
        await edaAPI.delete(page, `projects/${newProject.id}/`).catch(() => {});
      }
    }
  });

  test('should not use a private DE without credentials', async ({ page }) => {
    test.setTimeout(180000);

    const deName = createE2EName('decision-environment');
    let privateDEId: number | undefined;
    let rbaId: number | undefined;

    try {
      await navigateTo(page, 'Automation Decisions', 'Decision Environments');
      await expect(page.getByRole('heading', { name: 'Decision Environments' })).toBeVisible();

      await page.getByRole('button', { name: 'Create decision environment', exact: true }).click();
      await page.getByRole('textbox', { name: 'Name' }).fill(deName);

      await page.getByRole('button', { name: 'Organization' }).click();
      await page.locator('#organization_id-search').getByRole('textbox').fill('Default');
      await page.getByRole('option', { name: 'Default' }).click();

      await page.getByLabel('Image').fill('quay.io/abakshirht/galaxy-ng-locust:ansible2.13');

      const createDEResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/eda/v1/decision-environments/') && response.status() === 201
      );

      await page.getByRole('button', { name: 'Create decision environment', exact: true }).click();

      const createDEResponse = await createDEResponsePromise;
      const privateDE = (await createDEResponse.json()) as EdaDecisionEnvironment;
      privateDEId = privateDE.id;

      await expect(page.getByRole('heading', { name: deName, exact: true })).toBeVisible();

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();
      await expect(page.getByRole('heading', { name: 'Create rulebook activation' })).toBeVisible();

      const rbaName = createE2EName('rulebook-activation');
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(rbaName);
      await page
        .getByRole('textbox', { name: 'Description', exact: true })
        .fill('This is a new rulebook activation.');

      await page.getByRole('button', { name: 'Organization' }).click();
      await page.locator('#organization_id-search').getByRole('textbox').fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Project' }).click();
      await page.locator('#project_id-search').getByRole('textbox').fill(edaProject.name);
      await page.getByRole('option', { name: edaProject.name }).click();

      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: edaRulebook.name }).click();

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      await page.locator('#decision_environment_id-search input').fill(deName);
      await page.getByRole('option', { name: deName }).click();

      await page.getByRole('button', { name: 'On failure' }).click();
      await page.getByRole('option', { name: 'Always' }).click();

      const createRBAResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/eda/v1/activations/') && response.status() === 201
      );

      await page.getByRole('button', { name: 'Create rulebook activation', exact: true }).click();

      const createRBAResponse = await createRBAResponsePromise;
      const createdRBA = (await createRBAResponse.json()) as ActivationRead;
      rbaId = createdRBA.id;

      await expect(page.getByRole('heading', { name: rbaName, exact: true })).toBeVisible();

      // Check if workers are available before waiting for failure
      const workersAvailable = await RulebookActivation.api.checkWorkersAvailable(
        page,
        createdRBA.id
      );
      if (!workersAvailable) {
        test.skip(true, 'EDA workers are not available - skipping test');
        return;
      }

      await RulebookActivation.api.waitForStatus(page, createdRBA.id, 'failed');
    } finally {
      if (rbaId) {
        await edaAPI.delete(page, `activations/${rbaId}/`).catch(() => {});
      }
      if (privateDEId) {
        await edaAPI
          .delete(page, `decision-environments/${privateDEId}/?force=true`)
          .catch(() => {});
      }
    }
  });
});

async function waitForProjectSync(
  page: Parameters<typeof edaAPI.get>[0],
  project: EdaProjectType
): Promise<EdaProjectType> {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const projectResult = (await edaAPI.get(page, 'projects/', {
      params: { name: project.name },
    })) as EdaResult<EdaProjectType>;

    if (projectResult?.results && projectResult.results.length > 0) {
      const currentProject = projectResult.results.find((p) => p.name === project.name);

      if (currentProject?.import_state) {
        const state = String(currentProject.import_state);
        if (state === 'completed' || state === 'failed') {
          return currentProject;
        }
      }
    }

    await page.waitForTimeout(2000);
    attempts++;
  }

  throw new Error(`Project sync timeout for project: ${project.name}`);
}
