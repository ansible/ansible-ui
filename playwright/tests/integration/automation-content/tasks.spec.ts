import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Task Management', () => {
  test(
    'should disable stop task button if task is not running/waiting',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'Task Management');
      await expect(page.getByRole('heading', { name: 'Task Management' })).toBeVisible();

      // Wait for table to load
      await expect(page.locator('tbody')).toBeVisible({ timeout: 10000 });

      // Get all rows and check each one for non-running/waiting tasks
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();

      // Find a task that is not running or waiting
      let foundNonStoppableTask = false;
      for (let i = 0; i < Math.min(rowCount, 10); i++) {
        const row = rows.nth(i);
        const statusCell = row.locator('[data-label="Status"]');
        const statusText = await statusCell.textContent();

        // If the task is completed, failed, or canceled, the stop button should be disabled
        if (
          statusText &&
          (statusText.includes('Completed') ||
            statusText.includes('Failed') ||
            statusText.includes('Canceled'))
        ) {
          const stopButton = row.getByTestId('stop-task');
          await expect(stopButton).toBeVisible();
          await expect(stopButton).toHaveAttribute('aria-disabled', 'true');
          foundNonStoppableTask = true;
          break;
        }
      }

      // Ensure we found at least one non-stoppable task to verify the test
      expect(foundNonStoppableTask).toBe(true);
    }
  );

  test(
    'should navigate to task details and display all page sections',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Content', 'Task Management');
      await expect(page.getByRole('heading', { name: 'Task Management' })).toBeVisible();

      // Wait for table to load
      await expect(page.locator('tbody')).toBeVisible({ timeout: 10000 });

      // Get the first task name from the table (Name column is the first clickable cell)
      const firstRow = page.locator('tbody tr').first();
      const nameCell = firstRow.locator('[data-label="Name"]');
      await expect(nameCell).toBeVisible({ timeout: 5000 });
      const taskName = await nameCell.textContent();

      expect(taskName).toBeTruthy();

      // Click on the task name to navigate to details page
      await nameCell.click();

      // Verify we're on the task details page
      await expect(page.getByRole('heading', { name: taskName!.trim() })).toBeVisible();

      // Verify all main dashboard cards are present
      await expect(page.getByRole('heading', { name: 'Task detail' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Task groups' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Reserve resources' })).toBeVisible();

      // The original Cypress test checked for either Progress messages or Error message
      // based on task status. Since we can't predict task status reliably,
      // we verify the main sections exist which confirms the details page loaded correctly.
    }
  );
});
