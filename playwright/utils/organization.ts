import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { Page, expect } from '@playwright/test';
import { awxAPI, edaAPI, gatewayAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';
import { navigateTo } from '../commands/navigateTo';
import { selectTableRow } from '../commands/selectTableRow';

const TERMINAL_STATUSES = new Set(['successful', 'failed', 'error', 'canceled']);

async function waitForOrganizationPropagation(
  page: Page,
  organizationName: string
): Promise<{ id: number }> {
  const maxAttempts = 30;
  let lastAwxOrganization: { id: number } | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const [awxOrganizations, edaOrganizations] = await Promise.all([
      awxAPI
        .get<{ results: { id: number; name: string }[] }>(page, '/organizations/', {
          params: { name: organizationName },
        })
        .catch(() => null),
      edaAPI
        .get<{
          results: { id: number; name: string }[];
        }>(page, `organizations/?name=${encodeURIComponent(organizationName)}`)
        .catch(() => null),
    ]);

    lastAwxOrganization = awxOrganizations?.results?.[0];

    // EDA is optional in some deployments. If its API is available, require
    // the organization there too before creating dependent EDA resources.
    const edaOrganizationIsReady =
      edaOrganizations === null || Boolean(edaOrganizations.results[0]);
    if (lastAwxOrganization && edaOrganizationIsReady) {
      return lastAwxOrganization;
    }

    await page.waitForTimeout(1000);
  }

  throw new Error(
    `Organization '${organizationName}' was not propagated to downstream services within ${maxAttempts} seconds`
  );
}

async function cancelInventoryJobs(page: Page, inventoryId: number): Promise<void> {
  const jobs = await awxAPI
    .get<{ results: { id: number; status: string }[] }>(page, '/inventory_updates/', {
      params: { inventory: inventoryId },
    })
    .catch(() => null);

  if (!jobs?.results) return;

  // Cancel running jobs
  for (const job of jobs.results) {
    if (!TERMINAL_STATUSES.has(job.status)) {
      await awxAPI
        .post(page, `/inventory_updates/${job.id}/cancel/`, undefined, { expectStatus: 202 })
        .catch(() => {});
    }
  }

  // Wait for jobs to reach terminal status
  for (const job of jobs.results) {
    let status = job.status;
    for (let i = 0; i < 30 && !TERMINAL_STATUSES.has(status); i++) {
      await page.waitForTimeout(1000);
      const updated = await awxAPI
        .get<{ status: string }>(page, `/inventory_updates/${job.id}/`)
        .catch(() => null);
      if (updated) status = updated.status;
    }
  }
}

export interface CreateOrganizationOptions {
  name?: string;
  description?: string;
}

export interface CreateOrganizationUIOptions {
  organizationName?: string;
  description?: string;
}

export interface AddUserToOrganizationOptions {
  userId: number;
  role?: 'member' | 'admin' | 'auditor';
}

export interface AddUserToOrganizationUIOptions {
  roles?: string[];
}

export const Organization = {
  api: {
    create: async (
      page: Page,
      options: CreateOrganizationOptions = {}
    ): Promise<PlatformOrganization> => {
      const organization = await gatewayAPI.post<PlatformOrganization>(page, 'organizations/', {
        name: options.name ?? createE2EName('Organization'),
        description: options.description ?? 'Created via API for E2E testing',
      });

      if (!organization) {
        throw new Error('Failed to create organization: API returned null');
      }

      // Look up by name since Gateway and downstream service IDs may differ.
      const downstreamOrganization = await waitForOrganizationPropagation(page, organization.name);
      return { ...organization, id: downstreamOrganization.id };
    },

    delete: async (page: Page, organizationId: number): Promise<void> => {
      await gatewayAPI.delete(page, `organizations/${organizationId}/`);
    },

    /**
     * Deletes an organization by name, canceling any running jobs first.
     * This handles dependent resources that might block deletion.
     */
    deleteByName: async (page: Page, organizationName: string): Promise<void> => {
      const orgs = await gatewayAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        '/organizations/',
        { params: { name: organizationName } }
      );

      if (!orgs || orgs.results.length === 0) {
        return;
      }

      const orgId = orgs.results[0].id;

      // Cancel running inventory jobs and delete inventories
      const inventories = await awxAPI
        .get<{ results: { id: number }[] }>(page, '/inventories/', {
          params: { organization: orgId },
        })
        .catch(() => null);

      for (const inventory of inventories?.results ?? []) {
        await cancelInventoryJobs(page, inventory.id);
        await awxAPI.delete(page, `/inventories/${inventory.id}/`).catch(() => {});
      }

      await gatewayAPI.delete(page, `organizations/${orgId}/`).catch(() => {});
    },

    get: async (page: Page, organizationId: number): Promise<PlatformOrganization> => {
      const organization = await gatewayAPI.get<PlatformOrganization>(
        page,
        `organizations/${organizationId}/`
      );

      if (!organization) {
        throw new Error(`Organization ${organizationId} not found`);
      }

      return organization;
    },

    addUser: async (
      page: Page,
      organizationId: number,
      options: AddUserToOrganizationOptions
    ): Promise<void> => {
      const role = options.role ?? 'member';
      await gatewayAPI.post(page, `organizations/${organizationId}/users/`, {
        user: options.userId,
        role,
      });
    },
  },

  ui: {
    create: async (page: Page, options: CreateOrganizationUIOptions = {}): Promise<string> => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await page.getByText('Create organization', { exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Create organization' })).toBeVisible();

      const organizationName = options.organizationName ?? createE2EName();
      await page.getByLabel('Name').fill(organizationName);

      if (options.description) {
        await page.getByLabel('Description').fill(options.description);
      }

      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Finish', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: organizationName, exact: true })
      ).toBeVisible();

      await waitForOrganizationPropagation(page, organizationName);

      return organizationName;
    },

    editFromList: async (
      page: Page,
      organizationName: string,
      newOrganizationName: string
    ): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ filterLabel: 'Name', text: organizationName }, page);

      await page.getByRole('button', { name: 'Edit organization', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Edit organization' })).toBeVisible();

      await page.getByLabel('Name').clear();
      await page.getByLabel('Name').fill(newOrganizationName);
      await page.getByRole('button', { name: 'Save organization', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: newOrganizationName, exact: true })
      ).toBeVisible();
    },

    delete: async (page: Page, organizationName: string): Promise<void> => {
      await deleteResourceFromDetailsPage(
        {
          resourceName: organizationName,
          resourceType: 'organization',
          filterLabel: 'Name',
          navigationPath: ['Access Management', 'Organizations'],
        },
        page
      );
    },

    addUser: async (
      page: Page,
      organizationName: string,
      username: string,
      options: AddUserToOrganizationUIOptions = {}
    ): Promise<void> => {
      const roles = options.roles ?? ['Organization Member'];

      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      await page.getByRole('tab', { name: 'Users' }).click();
      await page.locator('a, button').filter({ hasText: 'Assign users' }).click();

      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      for (let i = 0; i < roles.length; i++) {
        await selectTableRow(
          {
            pageTitle: 'Select organization roles',
            filterLabel: 'Name',
            filterValue: roles[i],
            clearFilters: i > 0,
          },
          page
        );
      }
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await page.waitForTimeout(1000);
      await expect(page.locator('tbody')).toContainText(username);
    },
  },
} as const;
