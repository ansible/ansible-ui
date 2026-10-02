import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { Page, expect } from '@playwright/test';
import { hubAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';
import { fillMonacoEditor } from '../commands/fillMonacoEditor';
import { navigateTo } from '../commands/navigateTo';

export interface CreateNamespaceOptions {
  name?: string;
  description?: string;
  company?: string;
  links?: { name: string; url: string }[];
  resources?: string;
}

export interface CreateNamespaceUIOptions {
  namespaceName?: string;
  description?: string;
  company?: string;
  resources?: string;
  linkText?: string;
  linkUrl?: string;
}

export const Namespace = {
  api: {
    create: async (page: Page, options: CreateNamespaceOptions = {}): Promise<HubNamespace> => {
      const namespace = await hubAPI.post<HubNamespace>(page, '_ui/v1/namespaces/', {
        name: options.name ?? createE2EName('namespace').toLowerCase().replace(/\s+/g, '_'),
        description: options.description ?? 'Created via API for E2E testing',
        company: options.company ?? 'E2E Test Company',
        links: options.links ?? [],
        resources: options.resources ?? '',
      });

      if (!namespace) {
        throw new Error('Failed to create namespace: API returned null');
      }

      return namespace;
    },

    delete: async (page: Page, namespaceName: string): Promise<void> => {
      await hubAPI.delete(page, `_ui/v1/namespaces/${namespaceName}/`);
    },

    get: async (page: Page, namespaceName: string): Promise<HubNamespace> => {
      const namespace = await hubAPI.get<HubNamespace>(page, `_ui/v1/namespaces/${namespaceName}/`);

      if (!namespace) {
        throw new Error(`Namespace ${namespaceName} not found`);
      }

      return namespace;
    },
  },

  ui: {
    create: async (page: Page, options: CreateNamespaceUIOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Content', 'Namespaces');
      await page.getByText('Create namespace', { exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Create namespace' })).toBeVisible();

      const namespaceName =
        options.namespaceName ?? createE2EName('namespace').toLowerCase().replace(/\s+/g, '_');
      await page.getByTestId('name').fill(namespaceName);

      if (options.company) {
        await page.getByTestId('company').fill(options.company);
      }

      if (options.description) {
        await page.getByTestId('description').fill(options.description);
      }

      if (options.resources) {
        await fillMonacoEditor(page, options.resources);
      }

      if (options.linkText && options.linkUrl) {
        await page.getByTestId('link-text-0').fill(options.linkText);
        await page.getByTestId('link-url-0').fill(options.linkUrl);
      }

      await page.getByTestId('Submit').click();

      await expect(page.getByRole('heading', { name: namespaceName, exact: true })).toBeVisible();

      return namespaceName;
    },

    edit: async (
      page: Page,
      namespaceName: string,
      options: { company?: string; description?: string }
    ): Promise<void> => {
      await navigateTo(page, 'Automation Content', 'Namespaces');
      await clickTableRow({ text: namespaceName }, page);

      await page.getByTestId('edit-namespace').click();
      await expect(page.getByRole('heading', { name: `Edit ${namespaceName}` })).toBeVisible();

      if (options.company !== undefined) {
        await page.getByTestId('company').clear();
        if (options.company) {
          await page.getByTestId('company').fill(options.company);
        }
      }

      if (options.description !== undefined) {
        await page.getByTestId('description').clear();
        if (options.description) {
          await page.getByTestId('description').fill(options.description);
        }
      }

      await page.getByTestId('Submit').click();

      if (options.company) {
        await expect(page.getByTestId('company')).toContainText(options.company);
      }
      if (options.description) {
        await expect(page.getByTestId('description')).toContainText(options.description);
      }
    },

    delete: async (page: Page, namespaceName: string): Promise<void> => {
      await deleteResourceFromDetailsPage(
        {
          resourceName: namespaceName,
          resourceType: 'namespace',
          filterLabel: 'Name',
          navigationPath: ['Automation Content', 'Namespaces'],
        },
        page
      );
    },
  },
} as const;
