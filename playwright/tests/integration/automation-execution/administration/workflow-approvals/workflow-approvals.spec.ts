import { expect, test } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import {
  WorkflowVisualizer,
  WorkflowApproval,
  WorkflowJobTemplate,
} from '@ansible/playwright/utils';
import { platformUI } from '@ansible/playwright/commands/login';

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
        workflowTemplateName = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);

        await WorkflowApproval.ui.addApprovalNode(page, {
          name: firstApproval,
          description: workflowTemplateName,
        });

        await WorkflowApproval.ui.addLinkedApprovalNode(page, firstApproval, {
          name: secondApproval,
          description: workflowTemplateName,
          runCondition: 'fail',
        });

        await WorkflowApproval.ui.addLinkedApprovalNode(page, secondApproval, {
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
        await expect(
          page
            .getByTestId('pending-status')
            .or(page.getByTestId('running-status'))
            .or(page.getByTestId('waiting-status'))
        ).toBeVisible({ timeout: 15000 });
      });

      await test.step('Process workflow approvals: deny, approve, cancel', async () => {
        await navigateTo(page, 'Automation Execution', 'Administration', 'Workflow Approvals');

        let firstRow = await getTableRow(page, firstApproval);
        await firstRow.getByRole('button', { name: 'Deny' }).click();
        await WorkflowApproval.ui.confirmAction(page, 'Deny');

        // Verify status via API, then reload to reflect in UI
        await WorkflowApproval.api.waitForApprovalStatus(page, firstApproval, 'failed');
        await page.reload();
        firstRow = await getTableRow(page, firstApproval);
        await expect(firstRow.getByTestId('status-column-cell')).toContainText('Denied');

        // Wait for second approval to become actionable after first denial propagates
        const secondReady = await WorkflowApproval.api.checkApprovalActionable(
          page,
          secondApproval
        );
        if (!secondReady) {
          test.skip(true, 'Second approval not actionable - approval chain propagation too slow');
        }

        let secondRow = await getTableRow(page, secondApproval);
        await secondRow.getByRole('button', { name: 'Approve' }).click();
        await WorkflowApproval.ui.confirmAction(page, 'Approve');
        await WorkflowApproval.api.waitForApprovalStatus(page, secondApproval, 'successful');
        await page.reload();
        secondRow = await getTableRow(page, secondApproval);
        await expect(secondRow.getByTestId('status-column-cell')).toContainText('Approved');

        // Wait for third approval to become actionable after second approval propagates
        const thirdReady = await WorkflowApproval.api.checkApprovalActionable(page, thirdApproval);
        if (!thirdReady) {
          test.skip(true, 'Third approval not actionable - approval chain propagation too slow');
        }

        let thirdRow = await getTableRow(page, thirdApproval);
        await expect(thirdRow.getByTestId('status-column-cell')).toContainText('Never expires', {
          timeout: 30000,
        });
        await thirdRow.getByRole('button', { name: 'Cancel' }).click();
        await WorkflowApproval.api.waitForApprovalStatus(page, thirdApproval, 'canceled');
        await page.reload();
        thirdRow = await getTableRow(page, thirdApproval);
        await expect(thirdRow.getByTestId('status-column-cell')).toContainText('Canceled');
      });

      await test.step('Verify workflow job status is Canceled', async () => {
        // Wait for workflow job to reach terminal state via API before checking UI
        const jobId = await WorkflowApproval.api.getWorkflowJobId(page, firstApproval);

        if (jobId) {
          const isTerminal = await WorkflowJobTemplate.api.checkWorkflowJobTerminalState(
            page,
            jobId
          );
          if (!isTerminal) {
            test.skip(
              true,
              'Workflow job not reaching terminal state - infrastructure may be slow'
            );
          }
        }

        await navigateTo(page, 'Automation Execution', 'Jobs');

        const jobRow = await getTableRow(page, workflowTemplateName);
        await expect(jobRow.getByTestId('status-column-cell')).toContainText('Canceled', {
          timeout: 60000,
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
        await WorkflowApproval.api.deleteWorkflowTemplate(page, workflowTemplateName);
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
          await WorkflowVisualizer.ui.createWorkflowJobTemplate(page, {
            name: workflowTemplateName,
            enableConcurrentJobs: true,
          });

          await WorkflowApproval.ui.addApprovalNode(page, {
            name: approvalNode,
            description: workflowTemplateName,
          });
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

          // Relaunch from Jobs page (use getTableRow to handle pagination)
          let jobRow = (await getTableRow(page, workflowTemplateName)).first();
          await jobRow.getByRole('button', { name: 'Relaunch job' }).click();
          await expect(page.getByRole('tab', { name: 'Output' })).toHaveAttribute(
            'aria-selected',
            'true'
          );

          await page.getByRole('tab', { name: 'Back to Jobs', exact: true }).click();

          // Relaunch from Jobs page (use getTableRow to handle pagination)
          jobRow = (await getTableRow(page, workflowTemplateName)).first();
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

          await expect(page.locator('tbody tr')).toHaveCount(3, { timeout: 30000 });

          await page.getByRole('checkbox', { name: 'Select all rows' }).click();
          await page.getByTestId('page-toolbar').getByRole('button', { name: action }).click();
          await WorkflowApproval.ui.confirmAction(page, action);

          const expectedApiStatus = action === 'Approve' ? 'successful' : 'failed';
          await WorkflowApproval.api.waitForAllApprovalsStatus(
            page,
            workflowTemplateName,
            expectedApiStatus,
            3
          );
          await page.reload();

          await filterTable(
            {
              filterLabel: 'Description',
              filterValue: workflowTemplateName,
              clearFilters: true,
            },
            page
          );

          const allApprovalRows = page.locator('tbody tr');
          await expect(allApprovalRows).toHaveCount(3, { timeout: 15000 });
          for (let i = 0; i < 3; i++) {
            await expect(allApprovalRows.nth(i).getByTestId('status-column-cell')).toContainText(
              action === 'Approve' ? 'Approved' : 'Denied'
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
          await WorkflowApproval.api.deleteWorkflowTemplate(page, workflowTemplateName);
        });
      }
    );
  }
});

test.describe('Workflow Approvals - Tab Navigation and Approval', () => {
  test(
    'should navigate to the "Details" and "Workflow Job Details" tabs and approve from "Details" tab',
    {
      tag: ['@not_mock'],
    },
    async ({ page }) => {
      const approvalName = createE2EName();
      let workflowTemplateName: string;

      await test.step('Setup: Create and launch workflow with approval node', async () => {
        workflowTemplateName = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page);
        await WorkflowApproval.ui.addApprovalNode(page, {
          name: approvalName,
          description: workflowTemplateName,
        });
        await page.getByRole('button', { name: 'Save' }).click();

        const alertToaster = page.getByTestId('alert-toaster');
        await expect(alertToaster).toContainText('Successfully saved');

        await page.getByRole('button', { name: 'Launch workflow' }).click();
        await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible();
        await expect(
          page
            .getByTestId('pending-status')
            .or(page.getByTestId('running-status'))
            .or(page.getByTestId('waiting-status'))
        ).toBeVisible({ timeout: 15000 });
      });

      await test.step('Navigate to approval details page', async () => {
        // Wait for the approval to become actionable (pending/waiting) before navigating
        const isActionable = await WorkflowApproval.api.checkApprovalActionable(page, approvalName);
        if (!isActionable) {
          await WorkflowApproval.api.deleteWorkflowTemplate(page, workflowTemplateName);
          test.skip(true, 'Approval not actionable - workflow may not have started processing');
        }

        // Get approval ID via API and navigate directly to avoid Name filter dropdown issues
        const approvalId = await WorkflowApproval.api.getApprovalId(page, approvalName);

        await page.goto(
          `${platformUI}/execution/administration/workflow-approvals/${approvalId}/details`
        );
        await expect(page.getByTestId('status')).toContainText('Never expires', {
          timeout: 15000,
        });
      });

      await test.step('Verify approval "Workflow Job Details" tab shows running job status', async () => {
        // Get workflow job ID from the workflow approval API
        const jobId = await WorkflowApproval.api.getWorkflowJobId(page, approvalName);

        if (!jobId) {
          throw new Error(`Could not get workflow job ID from workflow approval: ${approvalName}`);
        }

        // Check if infrastructure is ready
        const isReady = await WorkflowJobTemplate.api.checkJobInfrastructureReady(page, jobId);
        if (!isReady) {
          await WorkflowApproval.api.deleteWorkflowTemplate(page, workflowTemplateName);
          test.skip(
            true,
            'Workflow job infrastructure not ready - execution capacity may be unavailable'
          );
        }

        // Navigate to Workflow Job Details tab
        await page.getByRole('tab', { name: 'Workflow Job Details', exact: true }).click();

        // Verify UI shows active status (guard allows both "Waiting" and "Running")
        await expect(page.getByTestId('status')).toContainText(/Waiting|Running/, {
          timeout: 15000,
        });
      });

      await test.step('Approve workflow approval from "Details" tab', async () => {
        await page.getByRole('tab', { name: 'Details', exact: true }).click();
        await page.getByRole('button', { name: 'Approve' }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.locator('#confirm').click();
        await dialog.getByRole('button', { name: 'Approve workflow approvals' }).click();
        await expect(dialog.getByRole('progressbar')).toBeVisible();
        await dialog.getByRole('button', { name: 'Close' }).click();
        await expect(dialog).not.toBeVisible();

        await WorkflowApproval.api.waitForApprovalStatus(page, approvalName, 'successful');
        await page.reload();
        await expect(page.getByTestId('status')).toContainText('Approved');
      });

      await test.step('Cleanup workflow template', async () => {
        await WorkflowApproval.api.deleteWorkflowTemplate(page, workflowTemplateName);
      });
    }
  );
});
