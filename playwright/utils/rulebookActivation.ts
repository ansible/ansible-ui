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
