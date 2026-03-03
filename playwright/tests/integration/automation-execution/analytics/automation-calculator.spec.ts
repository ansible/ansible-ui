import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { platformUI } from '@ansible/playwright/commands/login';
import {
  Organization,
  Project,
  Inventory,
  JobTemplate,
  Settings,
  type SystemSettings,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Automation Calculator', () => {
  test(
    'should render failed hosts count if one or more exists',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      const analyticsUser = process.env.ANALYTICS_USER;
      const analyticsPassword = process.env.ANALYTICS_PASSWORD;

      test.skip(
        !analyticsUser || !analyticsPassword,
        'ANALYTICS_USER and ANALYTICS_PASSWORD environment variables are required'
      );

      let organizationId: number | undefined;
      let projectId: number | undefined;
      let inventoryId: number | undefined;
      let jobTemplateId: number | undefined;
      let originalSettings: SystemSettings | undefined;

      try {
        await test.step('Configure system settings for analytics via API', async () => {
          // Capture original settings before modifying
          originalSettings = await Settings.api.getSystem(page);

          await Settings.api.patchSystem(page, {
            REDHAT_USERNAME: analyticsUser!,
            REDHAT_PASSWORD: analyticsPassword!,
            AUTOMATION_ANALYTICS_URL: 'https://console.redhat.com/api/ingress/v1/upload',
            INSIGHTS_TRACKING_STATE: true,
          });
        });

        await test.step('Create resources and launch a failing job', async () => {
          const organization = await Organization.api.create(page);
          organizationId = organization.id;

          const project = await Project.api.create(page, {
            organization: organizationId,
            scm_url: 'https://github.com/ansible/test-playbooks',
          });
          projectId = project.id;

          await Project.api.sync(page, projectId);

          const inventory = await Inventory.api.create(page, {
            organization: organizationId,
          });
          inventoryId = inventory.id;

          const jobTemplate = await JobTemplate.api.create(page, {
            projectId,
            inventoryId,
            playbook: 'fail.yml',
          });
          jobTemplateId = jobTemplate.id;

          await JobTemplate.api.launch(page, jobTemplateId, {
            waitForStatus: ['failed', 'error'],
          });
        });

        await test.step('Navigate to Automation Calculator and verify analytics data loaded', async () => {
          await page.goto(`${platformUI}/analytics/automation-calculator`);
          await page.reload({ waitUntil: 'networkidle' });

          // Verify the page loaded with analytics data
          await expect(page.getByRole('heading', { name: 'Automation calculator' })).toBeVisible();

          // Verify the chart title
          await expect(page.getByText('Automation savings', { exact: true })).toBeVisible({
            timeout: 60000,
          });

          // Verify the Y-axis label showing failed and successful host count
          await expect(
            page
              .locator('#chart-axis-1-ChartLabel')
              .getByText('Total successful and failed host count', { exact: true })
          ).toBeVisible();
        });
      } finally {
        // Restore original system settings
        if (originalSettings) {
          await Settings.api
            .patchSystem(page, {
              REDHAT_USERNAME: originalSettings.REDHAT_USERNAME,
              REDHAT_PASSWORD: originalSettings.REDHAT_PASSWORD,
              AUTOMATION_ANALYTICS_URL: originalSettings.AUTOMATION_ANALYTICS_URL,
              INSIGHTS_TRACKING_STATE: originalSettings.INSIGHTS_TRACKING_STATE,
            })
            .catch(() => {});
        }

        if (jobTemplateId) {
          await JobTemplate.api.delete(page, jobTemplateId).catch(() => {});
        }
        if (inventoryId) {
          await Inventory.api.delete(page, inventoryId).catch(() => {});
        }
        if (projectId) {
          await Project.api.delete(page, projectId).catch(() => {});
        }
        if (organizationId) {
          await Organization.api.delete(page, organizationId).catch(() => {});
        }
      }
    }
  );
});
