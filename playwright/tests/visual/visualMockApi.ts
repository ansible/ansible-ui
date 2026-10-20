import type { Page } from '@playwright/test';

type VisualMockPage =
  | 'credentials'
  | 'edaRulebookActivations'
  | 'inventoryDetails'
  | 'overview'
  | 'platformOrganizations'
  | 'platformUsers'
  | 'templates';

const mockDashboardResponse = {
  inventories: { total: 12, total_with_inventory_source: 5, job_failed: 1, inventory_failed: 0 },
  inventory_sources: {},
  groups: { total: 24, inventory_failed: 0 },
  hosts: { total: 87, failed: 3 },
  projects: { total: 9, failed: 1 },
  scm_types: {},
  users: { total: 6 },
  organizations: { total: 3 },
  teams: { total: 4 },
  credentials: { total: 15 },
  job_templates: { total: 22 },
};

const mockTemplatesResponse = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'job_template',
      name: 'Demo Job Template',
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        labels: { count: 1, results: [{ id: 1, name: 'production' }] },
        recent_jobs: [{ id: 101, status: 'successful', finished: '2025-06-01T14:30:00.000000Z' }],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 2,
      type: 'workflow_job_template',
      name: 'Provision Cloud Infrastructure',
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        labels: { count: 0, results: [] },
        recent_jobs: [{ id: 202, status: 'failed', finished: '2025-05-30T11:00:00.000000Z' }],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 3,
      type: 'job_template',
      name: 'Patch Linux Hosts',
      summary_fields: {
        organization: { id: 2, name: 'Operations' },
        labels: {
          count: 2,
          results: [
            { id: 2, name: 'security' },
            { id: 3, name: 'linux' },
          ],
        },
        recent_jobs: [],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
    {
      id: 4,
      type: 'job_template',
      name: 'Network Backup',
      summary_fields: {
        organization: { id: 2, name: 'Operations' },
        labels: { count: 0, results: [] },
        recent_jobs: [],
        user_capabilities: { edit: true, delete: true, start: true, copy: true },
      },
    },
  ],
};

const mockInventory = {
  id: 1,
  type: 'inventory',
  name: 'Production Inventory',
  description: 'Hosts for production environment',
  kind: '',
  organization: 1,
  variables: '',
  total_hosts: 0,
  created: '2025-01-15T10:00:00.000000Z',
  modified: '2025-03-20T14:30:00.000000Z',
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    user_capabilities: { edit: true, delete: true, copy: true, adhoc: true },
    labels: { count: 0, results: [] },
  },
};

const mockActivationsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 21,
      name: 'Order Events Activation',
      description: 'Starts order processing when an event arrives.',
      status: 'running',
      is_enabled: true,
      rules_count: 8,
      rules_fired_count: 124,
      restart_count: 2,
      status_message: 'Activation is running normally.',
      created_at: '2025-06-01T14:30:00.000000Z',
      modified_at: '2025-06-02T14:30:00.000000Z',
    },
    {
      id: 22,
      name: 'Inventory Drift Activation',
      description: 'Detects changes to managed inventory.',
      status: 'stopped',
      is_enabled: false,
      rules_count: 3,
      rules_fired_count: 17,
      restart_count: 0,
      status_message: 'Activation is stopped by an administrator.',
      created_at: '2025-06-03T14:30:00.000000Z',
      modified_at: '2025-06-04T14:30:00.000000Z',
    },
  ],
};

const mockUsersResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 31,
      url: '/api/gateway/v1/users/31/',
      username: 'automation-admin',
      email: 'automation-admin@example.test',
      first_name: 'Automation',
      last_name: 'Administrator',
      is_superuser: true,
      is_platform_auditor: false,
      managed: false,
      created: '2025-06-01T14:30:00.000000Z',
      modified: '2025-06-02T14:30:00.000000Z',
      last_login: '2025-06-04T10:15:00.000000Z',
    },
    {
      id: 32,
      url: '/api/gateway/v1/users/32/',
      username: 'platform-auditor',
      email: 'platform-auditor@example.test',
      first_name: 'Platform',
      last_name: 'Auditor',
      is_superuser: false,
      is_platform_auditor: true,
      managed: false,
      created: '2025-06-03T14:30:00.000000Z',
      modified: '2025-06-04T14:30:00.000000Z',
      last_login: null,
    },
  ],
};

const mockOrganizationsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 41,
      name: 'Automation Operations',
      description: 'Shared automation resources for operations teams.',
      url: '/api/gateway/v1/organizations/41/',
      created: '2025-06-01T14:30:00.000000Z',
      modified: '2025-06-02T14:30:00.000000Z',
      managed: false,
      summary_fields: { related_field_counts: { users: 12, teams: 3 } },
    },
    {
      id: 42,
      name: 'Development',
      description: 'Development and testing automation resources.',
      url: '/api/gateway/v1/organizations/42/',
      created: '2025-06-03T14:30:00.000000Z',
      modified: '2025-06-04T14:30:00.000000Z',
      managed: false,
      summary_fields: { related_field_counts: { users: 5, teams: 2 } },
    },
  ],
};

const mockCredentialsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Demo Machine Credential',
      description: 'Credential used by visual regression coverage',
      created: '2025-06-01T14:30:00.000000Z',
      modified: '2025-06-02T14:30:00.000000Z',
      summary_fields: { credential_type: { id: 1, name: 'Machine' }, organization: null },
      kind: 'ssh',
      credential_type: 1,
      credential_type__namespace: 'ansible',
      credential_type__kind: 'ssh',
      inputs: {},
      cloud: false,
      organization: null,
      managed: false,
      kubernetes: false,
    },
    {
      id: 2,
      name: 'Operations Credential',
      description: 'Credential for the operations team',
      created: '2025-06-03T14:30:00.000000Z',
      modified: '2025-06-04T14:30:00.000000Z',
      summary_fields: { credential_type: { id: 1, name: 'Machine' }, organization: null },
      kind: 'ssh',
      credential_type: 1,
      credential_type__namespace: 'ansible',
      credential_type__kind: 'ssh',
      inputs: {},
      cloud: false,
      organization: null,
      managed: false,
      kubernetes: false,
    },
  ],
};

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});
const options = { actions: { GET: {}, POST: {} } };

export async function installVisualMockApi(page: Page, pages: readonly VisualMockPage[]) {
  if (pages.includes('overview')) {
    await page.route('**/api/controller/v2/dashboard/**', (route) =>
      route.fulfill(json(mockDashboardResponse))
    );
  }
  if (pages.includes('templates')) {
    await page.route('**/api/controller/v2/unified_job_templates/**', (route) =>
      route.fulfill(json(mockTemplatesResponse))
    );
  }
  if (pages.includes('inventoryDetails')) {
    await page.route('**/api/controller/v2/inventories/?**', (route) =>
      route.fulfill(json({ count: 1, next: null, previous: null, results: [mockInventory] }))
    );
    await page.route('**/api/controller/v2/inventories/1/**', (route) => {
      if (route.request().url().includes('/instance_groups/'))
        return route.fulfill(json({ count: 0, next: null, previous: null, results: [] }));
      return route.fulfill(json(mockInventory));
    });
  }
  if (pages.includes('credentials')) {
    await page.route('**/api/controller/v2/credential_types/**', (route) =>
      route.fulfill(
        json({
          count: 1,
          next: null,
          previous: null,
          results: [{ id: 1, name: 'Machine', description: 'Machine credential' }],
        })
      )
    );
    await page.route('**/api/eda/v1/credential_types/**', (route) =>
      route.fulfill(
        json({
          count: 1,
          next: null,
          previous: null,
          results: [{ id: 1, name: 'Machine', description: 'Machine credential' }],
        })
      )
    );
    await page.route('**/api/controller/v2/credentials/**', (route) =>
      route.fulfill(json(mockCredentialsResponse))
    );
    await page.route('**/api/eda/v1/credentials/**', (route) =>
      route.fulfill(json(mockCredentialsResponse))
    );
  }
  if (pages.includes('edaRulebookActivations')) {
    await page.route('**/api/eda/v1/activations/**', (route) =>
      route.fulfill(
        json(route.request().method() === 'OPTIONS' ? options : mockActivationsResponse)
      )
    );
  }
  if (pages.includes('platformUsers')) {
    await page.route('**/api/gateway/v1/users/**', (route) =>
      route.fulfill(json(route.request().method() === 'OPTIONS' ? options : mockUsersResponse))
    );
  }
  if (pages.includes('platformOrganizations')) {
    await page.route('**/api/gateway/v1/organizations/**', (route) =>
      route.fulfill(
        json(route.request().method() === 'OPTIONS' ? options : mockOrganizationsResponse)
      )
    );
  }
}

export type { VisualMockPage };
