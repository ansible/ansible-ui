import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { WorkflowVisualizer } from '@ansible/playwright/utils';
import {
  assertInvalidInputShowsPatternDescription,
  requireOptionsFieldPattern,
  waitForAwxOptionsResponse,
} from '@ansible/playwright/utils/optionsDrivenValidation';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test.describe('Workflow approval OPTIONS-driven validation', () => {
  test(
    'applies OPTIONS validation to approval node name field',
    { tag: ['@not_mock', '@tier2'] },
    async ({ page }, testInfo) => {
      test.setTimeout(5 * 60 * 1000);

      const wfName = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible({
        timeout: 15000,
      });

      const templates = await awxAPI.get<{ results: { id: number }[] }>(
        page,
        '/workflow_job_templates/',
        { params: { name: wfName } }
      );
      const wfId = templates?.results?.[0]?.id;
      testInfo.skip(!wfId, `Workflow job template "${wfName}" not found after UI create`);

      const nodes = await awxAPI.get<{ results: { id: number }[] }>(
        page,
        `/workflow_job_templates/${wfId}/workflow_nodes/`
      );
      const workflowNodeId = nodes?.results?.[0]?.id;
      testInfo.skip(!workflowNodeId, 'No workflow nodes returned for approval OPTIONS path');

      const approvalOptionsPath = `/workflow_job_template_nodes/${workflowNodeId}/create_approval_template/`;
      const nameField = await requireOptionsFieldPattern(
        page,
        approvalOptionsPath,
        'name',
        testInfo
      );

      await expect(page.getByRole('button', { name: 'Add step' }).nth(1)).toBeVisible({
        timeout: 30000,
      });
      await page.getByRole('button', { name: 'Add step' }).nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Job Template', exact: true }).click();

      const approvalOptionsResponse = waitForAwxOptionsResponse(page, 'create_approval_template');
      await page.getByRole('option', { name: 'Approval', exact: true }).click();
      await approvalOptionsResponse;

      const nameInput = page.getByTestId('approval_name');
      await expect(nameInput).toBeVisible();
      await assertInvalidInputShowsPatternDescription(page, testInfo, nameField, {
        fill: async (value) => {
          await nameInput.fill(value);
        },
        blur: async () => {
          await nameInput.blur();
        },
      });

      await WorkflowVisualizer.ui.deleteWorkflowJobTemplate(page, wfName);
    }
  );
});
