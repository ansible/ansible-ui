import { expect, test } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { createWorkflowJobTemplate } from '../../workflow-visualizer/workflow-visualizer-utils';
import {
  addApprovalNode,
  addLinkedApprovalNode,
  confirmWorkflowApprovalAction,
  deleteWorkflowTemplateAPI,
} from './workflow-approvals-utils';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test.describe('Workflow Approvals - Individual Actions', () => {
  test.setTimeout(2.5 * 60 * 1000);

  test(
    'admin can approve, deny, cancel a workflow approval from the list',
    {
      tag: ['@not_mock'],
    },
    async ({ page }) => {
      const firstApproval = createE2EName();
      const secondApproval = createE2EName();
      const thirdApproval = createE2EName();
      let workflowTemplateName: string;

      await test.step('Create workflow with 3 linked approval nodes', async () => {
        workflowTemplateName = await createWorkflowJobTemplate(page);

        await addApprovalNode(page, { name: firstApproval, description: workflowTemplateName });

        await addLinkedApprovalNode(page, firstApproval, {
          name: secondApproval,
          description: workflowTemplateName,
          runCondition: 'fail',
        });

        await addLinkedApprovalNode(page, secondApproval, {
          name: thirdApproval,
          description: workflowTemplateName,
          runCondition: 'success',
        });

        await page.getByRole('button', { name: 'Save' }).click();

        const alertToaster = page.getByTestId('alert-toaster');
        await expect(alertToaster).toBeVisible();
        await expect(alertToaster).toContainText('Successfully saved');
      });

      await test.step('Launch workflow and wait for running status', async () => {
        await page.getByRole('button', { name: 'Launch workflow' }).click();

        await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible();
        await expect(page.getByTestId('running-status')).toHaveText('Running');
      });

      await test.step('Process workflow approvals: deny, approve, cancel', async () => {
        await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');

        const firstRow = await getTableRow(page, firstApproval);
        await firstRow.getByRole('button', { name: 'Deny' }).click();
        await confirmWorkflowApprovalAction(page, 'Deny');

        await expect(firstRow.getByTestId('status-column-cell')).toContainText('Denied', {
          timeout: 20000,
        });

        const secondRow = await getTableRow(page, secondApproval);
        await secondRow.getByRole('button', { name: 'Approve' }).click();
        await confirmWorkflowApprovalAction(page, 'Approve');
        await expect(secondRow.getByTestId('status-column-cell')).toContainText('Approved', {
          timeout: 20000,
        });

        const thirdRow = await getTableRow(page, thirdApproval);
        await thirdRow.getByRole('button', { name: 'Cancel' }).click();
        await expect(thirdRow.getByTestId('status-column-cell')).toContainText('Canceled', {
          timeout: 20000,
        });
      });

      await test.step('Verify workflow job status is Canceled', async () => {
        await navigateTo(page, 'Automation Execution', 'Jobs');

        const jobRow = await getTableRow(page, workflowTemplateName);
        await expect(jobRow.getByTestId('status-column-cell')).toContainText('Canceled', {
          timeout: 30000,
        });
      });

      await test.step('Bulk delete workflow approvals via UI', async () => {
        await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');

        await filterTable(
          {
            filterLabel: 'Description',
            filterValue: workflowTemplateName,
            clearFilters: true,
          },
          page
        );

        await expect(page.locator('tbody tr')).toHaveCount(3, { timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Select all rows' }).click();
        await page.getByRole('button', { name: 'toolbar actions' }).click();

        await expect(
          page.getByRole('menuitem', { name: 'Delete workflow approvals' })
        ).toBeVisible();
        await page.getByRole('menuitem', { name: 'Delete workflow approvals' }).click();

        await confirmAndAssertDeletion(page);
      });

      await test.step('Cleanup workflow template', async () => {
        await deleteWorkflowTemplateAPI({ workflowTemplateName }, page);
      });
    }
  );
});

test.describe('Workflow Approvals - Bulk Approve/Deny Actions', () => {
  test.setTimeout(2.5 * 60 * 1000);

  for (const action of ['Approve', 'Deny'] as const) {
    test(
      `can bulk ${action.toLowerCase()} workflow approvals`,
      {
        tag: ['@not_mock'],
      },
      async ({ page }) => {
        const workflowTemplateName = createE2EName();
        const approvalNode = createE2EName();

        await test.step('Create concurrent workflow job template with approval node', async () => {
          await createWorkflowJobTemplate(page, {
            name: workflowTemplateName,
            enableConcurrentJobs: true,
          });

          await addApprovalNode(page, { name: approvalNode, description: workflowTemplateName });
          await page.getByRole('button', { name: 'Save' }).click();

          const alertToaster = page.getByTestId('alert-toaster');
          await expect(alertToaster).toBeVisible();
          await expect(alertToaster).toContainText('Successfully saved');
        });

        await test.step('Launch workflow three times and wait for approvals', async () => {
          // Launch from visualizer
          await page.getByRole('button', { name: 'Launch workflow' }).click();
          await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
            'aria-selected',
            'true'
          );
          await page.getByRole('tab', { name: 'Back to Jobs', exact: true }).click();

          // Relaunch from Jobs page
          let jobRow = page.getByRole('row').filter({ hasText: workflowTemplateName }).first();
          await jobRow.getByRole('button', { name: 'Relaunch job' }).click();
          await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
            'aria-selected',
            'true'
          );

          await page.getByRole('tab', { name: 'Back to Jobs', exact: true }).click();

          // Relaunch from Jobs page
          jobRow = page.getByRole('row').filter({ hasText: workflowTemplateName }).first();
          await jobRow.getByRole('button', { name: 'Relaunch job' }).click();
          await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
            'aria-selected',
            'true'
          );
        });

        await test.step(`Bulk ${action.toLowerCase()} the workflow approvals`, async () => {
          await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');
          await expect(page.getByText('Search')).toBeVisible();

          await filterTable(
            {
              filterLabel: 'Description',
              filterValue: workflowTemplateName,
              clearFilters: true,
            },
            page
          );

          await page.getByRole('checkbox', { name: 'Select all rows' }).click();
          await page.getByTestId('page-toolbar').getByRole('button', { name: action }).click();
          await confirmWorkflowApprovalAction(page, action);

          const allApprovalRows = page.locator('tbody tr');
          for (let i = 0; i < 3; i++) {
            await expect(allApprovalRows.nth(i).getByTestId('status-column-cell')).toContainText(
              action === 'Approve' ? 'Approved' : 'Denied',
              {
                timeout: 10000,
              }
            );
          }
        });

        await test.step('Bulk delete the workflow approvals', async () => {
          await filterTable(
            {
              filterLabel: 'Description',
              filterValue: workflowTemplateName,
              clearFilters: true,
            },
            page
          );
          await expect(page.locator('tbody tr')).toHaveCount(3);

          const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all rows' });
          if ((await selectAllCheckbox.isChecked()) === false) {
            await selectAllCheckbox.click();
          }

          await page.getByRole('button', { name: 'toolbar actions' }).click();

          await expect(
            page.getByRole('menuitem', { name: 'Delete workflow approvals' })
          ).toBeVisible();
          await page.getByRole('menuitem', { name: 'Delete workflow approvals' }).click();

          await confirmAndAssertDeletion(page);
        });

        await test.step('Cleanup resources', async () => {
          await deleteWorkflowTemplateAPI({ workflowTemplateName }, page);
        });
      }
    );
  }
});
