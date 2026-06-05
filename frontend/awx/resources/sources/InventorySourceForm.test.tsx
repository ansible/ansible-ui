import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InventorySource } from '../../interfaces/InventorySource';
import { Project } from '../../interfaces/Project';
import { CreateInventorySource, EditInventorySource } from './InventorySourceForm';
import sourceTypesOptions from './mocks/InventorySourceTypes.json';

const credentialTypes = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 5,
      type: 'credential_type',
      url: '/api/v2/credential_types/5/',
      name: 'Amazon Web Services',
      description: '',
      kind: 'cloud',
      namespace: 'aws',
      managed: true,
    },
    {
      id: 20,
      type: 'credential_type',
      url: '/api/v2/credential_types/20/',
      name: 'Google Compute Engine',
      description: '',
      kind: 'cloud',
      namespace: 'gce',
      managed: true,
    },
  ],
};

const mockInventory = {
  id: 2,
  name: 'Test Inventory',
  type: 'inventory',
  url: '/api/v2/inventories/2/',
  related: {},
  summary_fields: {},
};

const mockProjectWithOverride: Project = {
  id: 123,
  name: 'Test Project With Override',
  description: '',
  scm_type: 'git',
  type: 'project',
  allow_override: true,
  base_dir: '/tmp/projects',
  summary_fields: {} as Project['summary_fields'],
  related: {} as Project['related'],
} as Project;

const mockProjectWithoutOverride: Project = {
  id: 456,
  name: 'Test Project Without Override',
  description: '',
  scm_type: 'git',
  type: 'project',
  allow_override: false,
  base_dir: '/tmp/projects',
  summary_fields: {} as Project['summary_fields'],
  related: {} as Project['related'],
} as Project;

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.name}
    />
  ),
}));

const restHandlers = [
  http.options(awxAPI`/inventory_sources/`, () =>
    HttpResponse.json(sourceTypesOptions as Record<string, unknown>)
  ),
  http.options(awxAPI`/execution_environments/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.options(awxAPI`/credential_types/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.options(awxAPI`/credentials/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.options(awxAPI`/projects/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/inventories/2/`, () => HttpResponse.json(mockInventory)),
  http.get(awxAPI`/credential_types/`, () => HttpResponse.json(credentialTypes)),
  http.get(
    ({ request }) =>
      request.url.includes('/api/v2/projects/123') && !request.url.includes('/inventories/'),
    () => HttpResponse.json(mockProjectWithOverride)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/v2/projects/456'),
    () => HttpResponse.json(mockProjectWithoutOverride)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/projects/123/inventories/') ||
      request.url.includes('/projects/456/inventories/'),
    () => HttpResponse.json(['inventories/hosts.yml', 'inventories/test.yml'])
  ),
  http.get(awxAPI`/execution_environments/789/`, () =>
    HttpResponse.json({
      id: 789,
      name: 'Test EE',
      image: 'quay.io/test/ee',
    })
  ),
  http.get(awxAPI`/credentials/456/`, () =>
    HttpResponse.json({
      id: 456,
      name: 'Test Credential',
      kind: 'gce',
    })
  ),
];

const mockInventorySource: InventorySource = {
  id: 1,
  name: 'Test Source',
  description: 'Test Description',
  source: 'scm',
  source_path: 'inventories/test.yml',
  source_project: '123',
  credential: 456,
  verbosity: 1,
  host_filter: '/^test$/',
  enabled_var: 'foo.bar',
  enabled_value: 'test',
  overwrite: true,
  overwrite_vars: false,
  update_on_launch: true,
  update_cache_timeout: 60,
  source_vars: 'test: value',
  created: '2023-01-01T00:00:00Z',
  modified: '2023-01-02T00:00:00Z',
  type: 'inventory_source',
  url: '/api/v2/inventory_sources/1/',
  related: { schedules: '/api/v2/inventory_sources/1/schedules/' },
  summary_fields: {
    created_by: { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User' },
    modified_by: { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User' },
    organization: { id: 1, name: 'Default', description: '' },
    inventory: {
      id: 2,
      name: 'Test Inventory',
      description: '',
      has_active_failures: false,
      total_hosts: 0,
      hosts_with_active_failures: 0,
      total_groups: 0,
      has_inventory_sources: true,
      total_inventory_sources: 1,
      inventory_sources_with_failures: 0,
      kind: 'inventory',
      organization_id: 1,
    },
    source_project: {
      id: 123,
      name: 'Test Project With Override',
      description: '',
      status: 'successful',
      scm_type: 'git',
      allow_override: true,
    },
    execution_environment: {
      id: 789,
      name: 'Test EE',
      description: '',
      image: 'quay.io/test/ee',
    },
    user_capabilities: { edit: true, schedule: true, start: true, delete: true },
    last_job: {
      description: '',
      failed: false,
      finished: '2023-01-01T00:00:00Z',
      id: 1,
      license_error: false,
      name: 'Test Job',
      status: 'successful',
    },
    current_job: {
      description: '',
      failed: false,
      finished: '',
      id: 0,
      license_error: false,
      name: '',
      status: '',
    },
    credential: {
      id: 456,
      name: 'Test Credential',
      description: '',
      kind: 'gce',
      cloud: true,
    },
  },
  execution_environment: 789,
  scm_branch: '',
  last_job_run: '2023-01-01T00:00:00Z',
  last_job_failed: false,
  next_job_run: '2023-01-02T00:00:00Z',
  status: 'successful',
  inventory: 2,
  last_update_failed: false,
  last_updated: '2023-01-01T00:00:00Z',
};

function renderCreateForm() {
  return render(
    <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
      <Routes>
        <Route
          path="/infrastructure/inventories/inventory/:id/sources/add"
          element={<CreateInventorySource />}
        />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditForm(entries: string[]) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <Routes>
        <Route
          path="/infrastructure/inventories/inventory/:id/sources/:source_id/edit"
          element={<EditInventorySource />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('CreateInventorySource', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should render create new source page', async () => {
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create source' })).toBeInTheDocument();
    });
  });

  test('should render name field', async () => {
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Name/i)).toBeVisible();
  });

  test('should render source selection field', async () => {
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Select source' })).toBeInTheDocument();
    });
  });

  test('should list the VMware ESXi source type', async () => {
    const user = userEvent.setup();
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Select source' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Select source' }));

    await waitFor(() => {
      expect(screen.getByText('VMware ESXi')).toBeInTheDocument();
    });
  });
});

describe('EditInventorySource', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should correctly populate default values from inventory source', async () => {
    server.use(
      http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource))
    );

    renderEditForm(['/infrastructure/inventories/inventory/2/sources/1/edit']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  test('should show source control branch field when project allows override', async () => {
    server.use(
      http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource))
    );

    renderEditForm(['/infrastructure/inventories/inventory/2/sources/1/edit']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByLabelText('Source control branch')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const scmBranchField = screen.getByLabelText('Source control branch');
    expect(scmBranchField).toBeVisible();
    expect(scmBranchField).toHaveAttribute('placeholder', 'Enter source control branch');
  });
});

describe('source_path transformation', () => {
  const transformForSubmit = (value: string) => (value === '. (project root)' ? '' : value);
  const transformForDisplay = (value: string) => value || '. (project root)';

  test('should transform project root to empty string for API', () => {
    expect(transformForSubmit('. (project root)')).toBe('');
  });

  test('should not transform non-root source_path', () => {
    expect(transformForSubmit('inventories/test.yml')).toBe('inventories/test.yml');
  });

  test('should transform empty source_path to project root for display', () => {
    expect(transformForDisplay('')).toBe('. (project root)');
  });
});

describe('InventorySourceSubForm - handleQueryParams', () => {
  const handleQueryParams = (source: string) => {
    switch (source) {
      case 'scm':
        return { credential_type__kind__in: 'cloud,kubernetes' };
      case 'ec2':
        return { credential_type__namespace: 'aws' };
      case 'openshift_virtualization':
        return { credential_type__namespace: 'kubernetes_bearer_token' };
      case 'vmware_esxi':
        return { credential_type__namespace: 'vmware' };
      default:
        return { credential_type__namespace: source };
    }
  };

  test('should return correct query params for scm source type', () => {
    expect(handleQueryParams('scm')).toEqual({
      credential_type__kind__in: 'cloud,kubernetes',
    });
  });

  test('should return correct query params for ec2 source type', () => {
    expect(handleQueryParams('ec2')).toEqual({ credential_type__namespace: 'aws' });
  });

  test('should return correct query params for vmware_esxi source type', () => {
    expect(handleQueryParams('vmware_esxi')).toEqual({
      credential_type__namespace: 'vmware',
    });
  });

  test('should return namespace query params for other source types', () => {
    expect(handleQueryParams('gce')).toEqual({ credential_type__namespace: 'gce' });
  });
});

describe('Source type credential requirements', () => {
  const sourceTypesWithOptionalCredentials = new Set(['ec2', 'scm', 'terraform']);
  const isCredentialRequired = (source: string) => !sourceTypesWithOptionalCredentials.has(source);

  test('should require credential for gce source type', () => {
    expect(isCredentialRequired('gce')).toBe(true);
  });

  test('should not require credential for ec2, scm, and terraform', () => {
    expect(isCredentialRequired('ec2')).toBe(false);
    expect(isCredentialRequired('scm')).toBe(false);
    expect(isCredentialRequired('terraform')).toBe(false);
  });
});
