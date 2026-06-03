import { expect, test } from '@playwright/test';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { toggleNodeKebab } from '@ansible/playwright/commands/toggleNodeKebab';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { Credential, JobTemplate, WorkflowVisualizer } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);
test.setTimeout(5 * 60 * 1000);

interface WFNode {
  id: number;
  extra_data: Record<string, unknown>;
  skip_tags: string;
  job_tags: string;
}

interface WFNodeList {
  results: WFNode[];
}

interface CredList {
  count: number;
  results: { id: number; name: string }[];
}

interface WFJTList {
  results: { id: number }[];
}

async function getWorkflowNode(page: import('@playwright/test').Page, wfjtName: string) {
  const wfjtList = (await awxAPI.get(page, 'workflow_job_templates/', {
    params: { name: wfjtName },
  })) as WFJTList;
  const wfjtId = wfjtList.results[0].id;
  const nodes = (await awxAPI.get(
    page,
    `workflow_job_templates/${wfjtId}/workflow_nodes/`
  )) as WFNodeList;
  return nodes.results[0];
}

async function getNodeCredentials(page: import('@playwright/test').Page, nodeId: number) {
  return (await awxAPI.get(page, `workflow_job_template_nodes/${nodeId}/credentials/`)) as CredList;
}

/**
 * Click on a node in the topology canvas to open the details side panel.
 * Uses the node circle area (above the label) to avoid hitting the kebab icon.
 */
async function clickNodeToViewDetails(nodeText: string, page: import('@playwright/test').Page) {
  const uniqueSuffix = nodeText.split(' ').at(-1) ?? nodeText;

  const fitBtn = page.getByRole('button', { name: 'Fit to Screen' });
  if (await fitBtn.isVisible()) {
    await fitBtn.click();
    await page.waitForTimeout(500);
  }

  const nodeLabel = page.locator('[class*="topology__node__label"]', { hasText: uniqueSuffix });
  await nodeLabel.waitFor({ state: 'visible' });
  const labelBox = await nodeLabel.boundingBox();
  if (!labelBox) throw new Error(`Node label not found for: ${nodeText}`);

  await page.mouse.click(labelBox.x + labelBox.width / 2, labelBox.y - 30);
  await page.getByTestId('workflow-topology-sidebar').waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Workflow Visualizer - Template Switch', () => {
  // ---------------------------------------------------------------------------
  // Scenario 1: A-prompts + defaults (no overrides) → B-no-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 1: should save cleanly when switching from a prompts template (defaults only) to a no-prompts template',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s1-prompts');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
      });

      const templateBName = createE2EName('jt-s1-noprompt');
      const templateB = await JobTemplate.api.create(page, { name: templateBName });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A — accept defaults, don't set any prompt values
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s1EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s1EditLaunchConfig;
      await expect(
        page.getByRole('navigation', { name: 'Steps' }).getByRole('button', { name: 'Prompts' })
      ).not.toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Save — should succeed without errors
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 2: A-prompts + credential override → B-no-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 2: should disassociate credential when switching from a template with credential override to one with no prompts',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s2-prompts');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
        ask_skip_tags_on_launch: true,
      });

      const templateBName = createE2EName('jt-s2-noprompt');
      const templateB = await JobTemplate.api.create(page, { name: templateBName });

      const credentialName = createE2EName('cred-s2');
      const credential = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName,
        username: 'testuser',
        password: 'testpass',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A and set credential
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('checkbox', { name: credentialName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (no prompts)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s2EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s2EditLaunchConfig;
      await expect(
        page.getByRole('navigation', { name: 'Steps' }).getByRole('button', { name: 'Prompts' })
      ).not.toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify side panel: after wizard finish, the in-memory node data should
      // immediately reflect the cleared credential — not show the stale DB value
      await clickNodeToViewDetails(templateBName, page);
      const sidebar = page.getByTestId('workflow-topology-sidebar');
      await expect(sidebar.getByText(credentialName)).not.toBeVisible({ timeout: 5000 });

      // Save — the bug would cause a 400 error here
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: credential disassociated
      const node = await getWorkflowNode(page, wfjt);
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credential);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 3: A-prompts + extra_vars override → B-no-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 3: should clear extra_vars when switching to a template with no prompts',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s3-vars');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_variables_on_launch: true,
      });

      const templateBName = createE2EName('jt-s3-novars');
      const templateB = await JobTemplate.api.create(page, { name: templateBName });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A and set extra_vars
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('textbox', { name: 'Editor content' }).fill('my_var: test_value');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s3EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s3EditLaunchConfig;
      await expect(
        page.getByRole('navigation', { name: 'Steps' }).getByRole('button', { name: 'Prompts' })
      ).not.toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: extra_data is empty
      const node = await getWorkflowNode(page, wfjt);
      expect(Object.keys(node.extra_data)).toHaveLength(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 4: A-prompts + multiple overrides → B-partial-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 4: should clear stale fields when switching to a template with only partial prompts',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s4-full');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
        ask_skip_tags_on_launch: true,
      });

      // Template B has only ask_credential_on_launch — not vars or tags
      const templateBName = createE2EName('jt-s4-partial');
      const templateB = await JobTemplate.api.create(page, {
        name: templateBName,
        ask_credential_on_launch: true,
      });

      const credentialName = createE2EName('cred-s4');
      const credential = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName,
        username: 'testuser',
        password: 'testpass',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A — set credential, extra_vars, skip_tags
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      // Set credential
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('checkbox', { name: credentialName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      // Set extra_vars
      await page.getByRole('textbox', { name: 'Editor content' }).fill('stale_var: old_value');
      // Set skip_tags
      await page.getByRole('textbox', { name: 'Type to filter' }).last().click();
      await page.getByRole('textbox', { name: 'Type to filter' }).last().fill('stale_tag');
      await page.getByRole('option', { name: 'Create "stale_tag"' }).click();

      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (partial prompts: only credential)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s4EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s4EditLaunchConfig;
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      // Template B has prompts but only credential — skip_tags and vars should be absent
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: skip_tags cleared, extra_data cleared, old credential disassociated
      const node = await getWorkflowNode(page, wfjt);
      expect(node.skip_tags).toBe('');
      expect(Object.keys(node.extra_data)).toHaveLength(0);
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credential);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 5: A-prompts + credential override → B-same-prompts (credential
  //             field should not be pre-filled with old credential)
  // ---------------------------------------------------------------------------
  test(
    'Scenario 5: should show empty credential field when switching to another template with the same prompt flags',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s5-a');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
      });

      const templateBName = createE2EName('jt-s5-b');
      const templateB = await JobTemplate.api.create(page, {
        name: templateBName,
        ask_credential_on_launch: true,
      });

      const credentialName = createE2EName('cred-s5');
      const credential = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName,
        username: 'testuser',
        password: 'testpass',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A and set credential
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('checkbox', { name: credentialName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (same prompt flags)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s5EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s5EditLaunchConfig;
      await page.getByRole('button', { name: 'Next' }).click({ force: true });

      // Navigate to Prompts, then wait for the credential to clear. NodeTypeStep calls
      // setValue AFTER both the launch-config and credentials fetches complete; using a
      // generous timeout lets the async reset propagate before we assert.
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(page.getByRole('button', { name: 'Credentials' })).not.toContainText(
        credentialName,
        { timeout: 15000 }
      );

      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify side panel: in-memory data should show no credential after wizard finish
      await clickNodeToViewDetails(templateBName, page);
      const s5Sidebar = page.getByTestId('workflow-topology-sidebar');
      await expect(s5Sidebar.getByText(credentialName)).not.toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: no credential on node
      const node = await getWorkflowNode(page, wfjt);
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credential);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 6: A-prompts + extra_vars override → B-same-prompts
  //             (extra_vars field should show empty in prompt step)
  // ---------------------------------------------------------------------------
  test(
    'Scenario 6: should show empty extra_vars when switching to another template with ask_variables_on_launch',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s6-a');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_variables_on_launch: true,
      });

      const templateBName = createE2EName('jt-s6-b');
      const templateB = await JobTemplate.api.create(page, {
        name: templateBName,
        ask_variables_on_launch: true,
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A and set extra_vars
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('textbox', { name: 'Editor content' }).fill('old_var: stale_value');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (same prompt flags)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s6EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s6EditLaunchConfig;
      await page.getByRole('button', { name: 'Next' }).click({ force: true });

      // Navigate to Prompts then wait for the extra_vars editor to clear.
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(page.getByRole('textbox', { name: 'Editor content' })).not.toHaveValue(
        /old_var/,
        { timeout: 15000 }
      );

      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: extra_data cleared
      const node = await getWorkflowNode(page, wfjt);
      expect(Object.keys(node.extra_data)).toHaveLength(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 7: A-prompts + overrides → B-same-prompts, user sets new values
  //             → new values saved correctly (not overridden by stale data)
  // ---------------------------------------------------------------------------
  test(
    'Scenario 7: should save user-entered values for the new template, not stale values from the old one',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s7-a');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
      });

      const templateBName = createE2EName('jt-s7-b');
      const templateB = await JobTemplate.api.create(page, {
        name: templateBName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
      });

      const oldCredName = createE2EName('cred-s7-old');
      const oldCred = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName: oldCredName,
        username: 'old',
        password: 'old',
      });

      const newCredName = createE2EName('cred-s7-new');
      const newCred = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName: newCredName,
        username: 'new',
        password: 'new',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A — set old credential and extra_vars
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(oldCredName);
      await page.getByRole('checkbox', { name: oldCredName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Editor content' }).fill('old_var: old');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B and set NEW values
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s7EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s7EditLaunchConfig;
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Next' }).click({ force: true });

      // Prompts step for Template B — set new credential and extra_vars
      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(newCredName);
      await page.getByRole('checkbox', { name: newCredName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Editor content' }).fill('new_var: fresh');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify side panel: in-memory data should show the new credential immediately
      await clickNodeToViewDetails(templateBName, page);
      const s7Sidebar = page.getByTestId('workflow-topology-sidebar');
      await expect(s7Sidebar.getByText(newCredName)).toBeVisible({ timeout: 5000 });
      await expect(s7Sidebar.getByText(oldCredName)).not.toBeVisible();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: new credential, new extra_data
      const node = await getWorkflowNode(page, wfjt);
      expect(node.extra_data).toEqual({ new_var: 'fresh' });

      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(1);
      expect(nodeCreds.results[0].name).toBe(newCredName);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, oldCred);
      await Credential.ui.delete(page, newCred);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 8: A-no-prompts + defaults → B-no-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 8: should save cleanly when switching between two templates with no prompts',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s8-a');
      const templateA = await JobTemplate.api.create(page, { name: templateAName });

      const templateBName = createE2EName('jt-s8-b');
      const templateB = await JobTemplate.api.create(page, { name: templateBName });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A (no prompts)
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (also no prompts)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s8EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s8EditLaunchConfig;
      await expect(
        page.getByRole('navigation', { name: 'Steps' }).getByRole('button', { name: 'Prompts' })
      ).not.toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Save — should succeed cleanly
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 9: A-no-prompts + orphaned credentials → B-no-prompts
  // ---------------------------------------------------------------------------
  test(
    'Scenario 9: should disassociate orphaned credentials when switching between no-prompts templates',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      // Create a template with prompts first, to let us set credentials on the node
      const tempPromptName = createE2EName('jt-s9-tmp');
      const tempPrompt = await JobTemplate.api.create(page, {
        name: tempPromptName,
        ask_credential_on_launch: true,
      });

      const templateBName = createE2EName('jt-s9-noprompt');
      const templateB = await JobTemplate.api.create(page, { name: templateBName });

      const credentialName = createE2EName('cred-s9');
      const credential = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName,
        username: 'testuser',
        password: 'testpass',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with the prompts template and set a credential
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(tempPromptName);
      await page.getByRole('option', { name: tempPromptName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('checkbox', { name: credentialName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Via API, change the template to remove prompts — now credential is orphaned
      await awxAPI.patch(page, `job_templates/${tempPrompt.id}/`, {
        ask_credential_on_launch: false,
      });

      // Reload the visualizer so it picks up the updated template
      await WorkflowVisualizer.ui.navigateToVisualizer(page, wfjt);

      // Edit node — switch to Template B (also no prompts)
      await toggleNodeKebab(tempPromptName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s9EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s9EditLaunchConfig;
      await expect(
        page.getByRole('navigation', { name: 'Steps' }).getByRole('button', { name: 'Prompts' })
      ).not.toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Save — should succeed, orphaned credential disassociated
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: orphaned credential gone
      const node = await getWorkflowNode(page, wfjt);
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(0);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credential);
      await JobTemplate.api.delete(page, tempPrompt.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 10: A-prompts + overrides → same template (no switch)
  //              All original values preserved
  // ---------------------------------------------------------------------------
  test(
    'Scenario 10: should preserve all prompt values when editing a node without changing the template',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s10');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
        ask_skip_tags_on_launch: true,
      });

      const credentialName = createE2EName('cred-s10');
      const credential = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName,
        username: 'testuser',
        password: 'testpass',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A — set credential and skip_tags
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('checkbox', { name: credentialName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).last().click();
      await page.getByRole('textbox', { name: 'Type to filter' }).last().fill('keep_tag');
      await page.getByRole('option', { name: 'Create "keep_tag"' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node WITHOUT changing template — just open, navigate through, finish
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(page.getByRole('button', { name: 'Credentials' })).toContainText(credentialName);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Save — should succeed
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: values preserved
      const node = await getWorkflowNode(page, wfjt);
      expect(node.skip_tags).toContain('keep_tag');
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBeGreaterThanOrEqual(1);
      expect(nodeCreds.results.some((c) => c.name === credentialName)).toBe(true);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credential);
      await JobTemplate.api.delete(page, templateA.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 11: A-prompts + overrides → same template, user changes credential
  // ---------------------------------------------------------------------------
  test(
    'Scenario 11: should update only the changed credential when editing without switching templates',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s11');
      const templateA = await JobTemplate.api.create(page, {
        name: templateAName,
        ask_credential_on_launch: true,
      });

      const credAName = createE2EName('cred-s11-A');
      const credA = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName: credAName,
        username: 'userA',
        password: 'passA',
      });

      const credBName = createE2EName('cred-s11-B');
      const credB = await Credential.ui.create(page, {
        credentialType: 'Machine',
        credentialName: credBName,
        username: 'userB',
        password: 'passB',
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A and credential A
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).nth(0).click({ force: true });

      await page.getByRole('button', { name: 'Prompts' }).click();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credAName);
      await page.getByRole('checkbox', { name: credAName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — same template, swap credential A for B
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Prompts' }).click();

      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('checkbox', { name: credAName }).uncheck();
      await page.getByRole('textbox', { name: 'Search input' }).clear();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credBName);
      await page.getByRole('checkbox', { name: credBName }).check();
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify side panel: in-memory data should show credential B, not A
      await clickNodeToViewDetails(templateAName, page);
      const s11Sidebar = page.getByTestId('workflow-topology-sidebar');
      await expect(s11Sidebar.getByText(credBName)).toBeVisible({ timeout: 5000 });
      await expect(s11Sidebar.getByText(credAName)).not.toBeVisible();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Verify via API: only credential B
      const node = await getWorkflowNode(page, wfjt);
      const nodeCreds = await getNodeCredentials(page, node.id);
      expect(nodeCreds.count).toBe(1);
      expect(nodeCreds.results[0].name).toBe(credBName);

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await Credential.ui.delete(page, credA);
      await Credential.ui.delete(page, credB);
      await JobTemplate.api.delete(page, templateA.id);
    }
  );

  // ---------------------------------------------------------------------------
  // Scenario 12: A-no-prompts + defaults → B-prompts
  //              Prompt step shows new template defaults, no stale data
  // ---------------------------------------------------------------------------
  test(
    'Scenario 12: should show fresh prompt defaults when switching from a no-prompts template to one with prompts',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const templateAName = createE2EName('jt-s12-noprompt');
      const templateA = await JobTemplate.api.create(page, { name: templateAName });

      const templateBName = createE2EName('jt-s12-prompts');
      const templateB = await JobTemplate.api.create(page, {
        name: templateBName,
        ask_credential_on_launch: true,
        ask_variables_on_launch: true,
        ask_skip_tags_on_launch: true,
      });

      const wfjt = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

      // Add node with Template A (no prompts)
      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible();
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();
      await page.getByRole('option', { name: 'Job Template', exact: true }).click();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateAName);
      await page.getByRole('option', { name: templateAName }).click();
      await page.getByRole('button', { name: 'Next' }).click({ force: true });
      await page.getByRole('button', { name: 'Finish' }).click();

      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Edit node — switch to Template B (has prompts)
      await toggleNodeKebab(templateAName, page);
      await page.getByRole('menuitem', { name: 'Edit step' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job template', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(templateBName);
      const s12EditLaunchConfig = page.waitForResponse(
        (resp) => resp.url().includes('/launch/') && resp.status() === 200
      );
      await page.getByRole('option', { name: templateBName }).click();
      await s12EditLaunchConfig;
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Next' }).click({ force: true });

      // Verify: Prompts step should appear with default/empty state
      await page.getByRole('button', { name: 'Prompts' }).click();
      await expect(page.getByRole('button', { name: 'Credentials' })).toBeVisible();
      // Credential selector should show empty placeholder (no stale data from a prior template).
      // Check for "Select credentials" text — the placeholder shown when no credential is selected.
      await expect(page.getByRole('button', { name: 'Credentials' })).toContainText(
        'Select credentials'
      );

      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Save — should succeed
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByText('Success alert:Successfully')).toBeVisible();
      await page.getByRole('button', { name: 'Close Success alert: alert:' }).click();

      // Cleanup
      await WorkflowVisualizer.ui.removeAllWorkflowVizNodes(page);
      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfjt);
      await JobTemplate.api.delete(page, templateA.id);
      await JobTemplate.api.delete(page, templateB.id);
    }
  );
});
