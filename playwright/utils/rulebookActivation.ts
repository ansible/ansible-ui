import type { EdaRulebookActivation as EdaRulebookActivationType } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { expect, Page } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';

export interface CreateRulebookActivationOptions {
  name?: string;
  projectName?: string;
  credentialName?: string;
  decisionEnvironmentName?: string;
  organizationName?: string;
  disabled?: boolean;
  restartPolicy?: 'Always' | 'On failure' | 'Never';
}

export interface CreateRulebookActivationAPIOptions {
  name?: string;
  rulebookId: number;
  decisionEnvironmentId: number;
  organizationId: number;
  description?: string;
  isEnabled?: boolean;
  restartPolicy?: 'always' | 'on-failure' | 'never';
  logLevel?: 'error' | 'info' | 'debug';
  restartOnProjectUpdate?: boolean;
}

export const RulebookActivation = {
  api: {
    create: async (
      page: Page,
      options: CreateRulebookActivationAPIOptions
    ): Promise<EdaRulebookActivationType> => {
      const activation = await edaAPI.post<EdaRulebookActivationType>(page, 'activations/', {
        name: options.name ?? createE2EName('rulebookActivation'),
        rulebook_id: options.rulebookId,
        decision_environment_id: options.decisionEnvironmentId,
        organization_id: options.organizationId,
        description: options.description ?? 'Created via API for E2E testing',
        is_enabled: options.isEnabled ?? false,
        restart_policy: options.restartPolicy ?? 'on-failure',
        log_level: options.logLevel ?? 'error',
        restart_on_project_update: options.restartOnProjectUpdate ?? false,
      });

      if (!activation) {
        throw new Error('Failed to create rulebook activation: API returned null');
      }

      return activation;
    },

    delete: async (page: Page, activationId: number): Promise<void> => {
      await edaAPI.delete(page, `activations/${activationId}/`);
    },

    get: async (page: Page, activationId: number): Promise<EdaRulebookActivationType> => {
      const activation = await edaAPI.get<EdaRulebookActivationType>(
        page,
        `activations/${activationId}/`
      );

      if (!activation) {
        throw new Error(`Rulebook activation ${activationId} not found`);
      }

      return activation;
    },

    disable: async (page: Page, activationId: number): Promise<void> => {
      await edaAPI.post(page, `activations/${activationId}/disable/`, {});
    },

    enable: async (page: Page, activationId: number): Promise<void> => {
      await edaAPI.post(page, `activations/${activationId}/enable/`, {});
    },

    /**
     * Checks if EDA workers are available by monitoring if an activation
     * transitions from "pending" status within a reasonable time (30s).
     *
     * Returns:
     * - true: Workers available (activation moved past "pending")
     * - false: Workers unavailable (status is "workers offline" OR stuck in "pending")
     *
     * @param page - Playwright page object
     * @param activationId - ID of the activation to monitor
     * @returns Promise<boolean> - true if workers available, false otherwise
     */
    checkWorkersAvailable: async (page: Page, activationId: number): Promise<boolean> => {
      const maxPendingTime = 30000; // 30 seconds
      const checkInterval = 2000; // 2 seconds
      const startTime = Date.now();

      while (Date.now() - startTime < maxPendingTime) {
        const activation = await RulebookActivation.api.get(page, activationId);
        const statusString = String(activation.status || '');

        // Explicit "workers offline" status
        if (statusString === 'workers offline') {
          return false;
        }

        // If activation has moved past "pending", workers are processing
        if (statusString && statusString !== 'pending') {
          return true;
        }

        await page.waitForTimeout(checkInterval);
      }

      // Stuck in "pending" for 30s - likely no workers
      return false;
    },

    /**
     * Waits for an activation to reach the expected status with enhanced worker detection.
     *
     * Improvements over basic polling:
     * 1. Detects "workers offline" status explicitly
     * 2. Fails fast if stuck in "pending" for too long (30s)
     * 3. Provides actionable error messages
     *
     * @param page - Playwright page object
     * @param activationId - ID of activation to monitor
     * @param expectedStatus - Expected final status (e.g., "completed", "failed")
     * @param timeout - Maximum time to wait in milliseconds (default: 200000)
     * @returns Promise<void>
     * @throws Error if activation doesn't reach expected status or workers are offline
     */
    waitForStatus: async (
      page: Page,
      activationId: number,
      expectedStatus: string,
      timeout: number = 200000
    ): Promise<void> => {
      const startTime = Date.now();
      const checkInterval = 2000;
      let pendingStartTime: number | null = null;
      const maxPendingTime = 30000;

      while (Date.now() - startTime < timeout) {
        const activation = await RulebookActivation.api.get(page, activationId);
        const currentStatus = String(activation.status || '');

        // Success: reached expected status
        if (currentStatus && currentStatus === expectedStatus) {
          return;
        }

        // Workers explicitly offline
        if (currentStatus === 'workers offline') {
          throw new Error(
            `EDA workers are offline. Activation ${activationId} cannot be processed. ` +
              `Current status: "${currentStatus}". Expected status: "${expectedStatus}". ` +
              `Hint: Ensure EDA workers are running on the server.`
          );
        }

        // Track how long we've been in "pending"
        if (currentStatus === 'pending') {
          if (pendingStartTime === null) {
            pendingStartTime = Date.now();
          } else if (Date.now() - pendingStartTime > maxPendingTime) {
            throw new Error(
              `Activation ${activationId} stuck in "pending" for ${maxPendingTime}ms. ` +
                `This likely means no EDA workers are available to process the activation. ` +
                `Expected status: "${expectedStatus}". ` +
                `Hint: Check if EDA workers are running and healthy.`
            );
          }
        } else {
          // Reset pending timer if we moved to a different status
          pendingStartTime = null;
        }

        // Terminal failure states
        const terminalStates = ['failed', 'error', 'stopped', 'unresponsive'];
        if (currentStatus && terminalStates.includes(currentStatus)) {
          // For tests expecting "failed", this might be success
          if (currentStatus === expectedStatus) {
            return;
          }
          throw new Error(
            `Activation ${activationId} reached terminal status "${currentStatus}" ` +
              `instead of expected "${expectedStatus}"`
          );
        }

        await page.waitForTimeout(checkInterval);
      }

      // Timeout reached
      const finalActivation = await RulebookActivation.api.get(page, activationId);
      const finalStatus = String(finalActivation.status || '');

      throw new Error(
        `Activation ${activationId} did not reach "${expectedStatus}" status within ${timeout}ms. ` +
          `Final status: "${finalStatus}". ` +
          `Hint: ${finalStatus === 'pending' ? 'Workers may be offline or overloaded.' : 'Check activation logs for errors.'}`
      );
    },
  },

  ui: {
    create: async (page: Page, options: CreateRulebookActivationOptions = {}): Promise<string> => {
      const rulebookActivationName = options.name ?? createE2EName('rulebookActivation');
      const projectName = options.projectName ?? 'Demo Project';

      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await page.getByText('Create rulebook activation').click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(rulebookActivationName);
      await page.getByRole('button', { name: 'Organization' }).click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .click();
      await page
        .locator('#organization_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(options.organizationName ?? 'Default');
      await page.getByRole('button', { name: 'Project' }).click();
      await expect(
        page.locator('#project_id-search').getByRole('textbox', { name: 'Search input' })
      ).toBeVisible();
      await page
        .locator('#project_id-search')
        .getByRole('textbox', { name: 'Search input' })
        .fill(projectName);
      await expect(page.getByRole('option', { name: projectName })).toBeVisible();

      await page.getByRole('option', { name: projectName }).click();
      await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
      await page.getByRole('option', { name: 'hello_echo.yml' }).click();

      if (options.credentialName) {
        await page.getByRole('button', { name: 'Credential' }).click();
        const credentialSearch = page.locator('#credential-select-search input');
        await expect(credentialSearch).toBeVisible();
        await credentialSearch.fill(options.credentialName);
        const credentialOption = page.getByRole('menuitem', { name: options.credentialName });
        await expect(credentialOption).toBeVisible({ timeout: 10000 });
        await credentialOption.click();
      }

      await page.getByRole('button', { name: 'Decision Environment' }).click();
      const decisionEnvSearch = page.locator('#decision_environment_id-search input');
      await expect(decisionEnvSearch).toBeVisible();
      await decisionEnvSearch.fill(options.decisionEnvironmentName!);
      const decisionEnvOption = page.getByRole('option', {
        name: options.decisionEnvironmentName!,
      });
      await expect(decisionEnvOption).toBeVisible({ timeout: 10000 });
      await decisionEnvOption.click();
      if (options?.restartPolicy) {
        await page.getByRole('button', { name: 'On failure' }).click();
        await page.getByRole('option', { name: options.restartPolicy }).click();
      }
      if (options?.disabled) {
        await page
          .getByRole('switch', { name: 'Rulebook activation enabled?' })
          .click({ force: true });
      }
      await page.getByRole('button', { name: 'Create rulebook activation' }).click();

      await expect(
        page.getByRole('heading', { name: rulebookActivationName, exact: true })
      ).toBeVisible();

      return rulebookActivationName;
    },

    delete: async (page: Page, rulebookActivationName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

      await clickTableRow(
        {
          text: rulebookActivationName,
          pageTitle: 'Rulebook Activations',
          filterLabel: 'Name',
          filterValue: rulebookActivationName,
          clearFilters: true,
        },
        page
      );

      await clickPageAction('Delete rulebook activation', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
