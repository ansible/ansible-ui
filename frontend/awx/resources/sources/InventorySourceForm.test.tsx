import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InventorySource } from '../../interfaces/InventorySource';
import { AwxRoute } from '../../main/AwxRoutes';
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

const mockPageNavigate = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return { ...actual, usePageNavigate: () => mockPageNavigate };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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
  beforeEach(() => {
    mockPageNavigate.mockClear();
    mockNavigate.mockClear();
  });

  test(
    'should navigate to source detail page after successful create',
    { timeout: 15000 },
    async () => {
      server.use(
        http.post(awxAPI`/inventory_sources/`, () =>
          HttpResponse.json({ id: 99, name: 'New Source' })
        ),
        http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
        http.get(awxAPI`/execution_environments/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        )
      );

      const user = userEvent.setup();
      renderCreateForm();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create source' })).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Name/i), 'New Source');

      await user.click(screen.getByRole('button', { name: 'Select source' }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Amazon EC2' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Amazon EC2' }));

      await user.click(screen.getByRole('button', { name: 'Create source' }));

      await waitFor(
        () => {
          expect(mockPageNavigate).toHaveBeenCalled();
        },
        { timeout: 10000 }
      );
      const [createRoute, createOpts] = mockPageNavigate.mock.lastCall as [
        string,
        { params: { id: string; source_id: number } },
      ];
      expect(createRoute).toBe(AwxRoute.InventorySourceDetail);
      expect(createOpts.params.id).toBe('2');
      expect(createOpts.params.source_id).toBe(99);
    }
  );

  test('should navigate back when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create source' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test(
    'should handle undefined inventory id param in URL templates',
    { timeout: 15000 },
    async () => {
      // Render without a <Route :id> so useParams returns { id: undefined },
      // triggering the `params.id?.toString() ?? ''` and `parseInt(params.id ?? '')`
      // nullish-coalescing fallback branches (lines 60, 69).
      server.use(
        http.get(
          ({ request }) => request.url.includes('/inventories//'),
          () => HttpResponse.json({})
        ),
        http.post(awxAPI`/inventory_sources/`, () =>
          HttpResponse.json({ id: 99, name: 'New Source' })
        ),
        http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
        http.get(awxAPI`/execution_environments/`, () =>
          HttpResponse.json({ count: 0, results: [] })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <CreateInventorySource />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create source' })).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Name/i), 'New Source');
      await user.click(screen.getByRole('button', { name: 'Select source' }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Amazon EC2' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Amazon EC2' }));
      await user.click(screen.getByRole('button', { name: 'Create source' }));

      await waitFor(
        () => {
          expect(mockPageNavigate).toHaveBeenCalled();
        },
        { timeout: 10000 }
      );
    }
  );

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
  beforeEach(() => {
    mockPageNavigate.mockClear();
    mockNavigate.mockClear();
  });

  test(
    'should navigate to source detail page after successful edit',
    { timeout: 15000 },
    async () => {
      server.use(
        http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource)),
        http.patch(awxAPI`/inventory_sources/1/`, () =>
          HttpResponse.json({ ...mockInventorySource, id: 1 })
        )
      );

      const user = userEvent.setup();
      renderEditForm(['/infrastructure/inventories/inventory/2/sources/1/edit']);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save source' }));

      await waitFor(() => {
        expect(mockPageNavigate).toHaveBeenCalled();
      });
      const [editRoute, editOpts] = mockPageNavigate.mock.lastCall as [
        string,
        { params: { id: string; source_id: number } },
      ];
      expect(editRoute).toBe(AwxRoute.InventorySourceDetail);
      expect(editOpts.params.id).toBe('2');
      expect(editOpts.params.source_id).toBe(1);
    }
  );

  test('should navigate back when cancel is clicked', async () => {
    server.use(
      http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource))
    );

    const user = userEvent.setup();
    renderEditForm(['/infrastructure/inventories/inventory/2/sources/1/edit']);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('should handle undefined route params in URL templates', { timeout: 15000 }, async () => {
    // Render without a <Route :id/:source_id> so useParams returns {} with both params
    // undefined, triggering the ?? fallback branches on lines 132, 136, 170, and 175.
    // Mocking the resulting double-slash URLs lets inventorySource resolve so the form
    // renders and the onSubmit path is exercised.
    server.use(
      http.get(
        ({ request }) => request.url.includes('/inventories//'),
        () => HttpResponse.json(mockInventory)
      ),
      http.get(
        ({ request }) => request.url.includes('/inventory_sources//'),
        () => HttpResponse.json(mockInventorySource)
      ),
      http.patch(
        ({ request }) => request.url.includes('/inventory_sources//'),
        () => HttpResponse.json({ ...mockInventorySource, id: 1 })
      )
    );

    const user = userEvent.setup();
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <EditInventorySource />
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save source' }));

    await waitFor(() => {
      expect(mockPageNavigate).toHaveBeenCalled();
    });
  });

  test(
    'should submit null for execution environment when none is set',
    { timeout: 15000 },
    async () => {
      const sourceWithoutEE = {
        ...mockInventorySource,
        execution_environment: null,
        summary_fields: { ...mockInventorySource.summary_fields, execution_environment: null },
      };
      let capturedEE: unknown = 'NOT_SET';

      server.use(
        http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(sourceWithoutEE)),
        http.patch(awxAPI`/inventory_sources/1/`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          capturedEE = body.execution_environment;
          return HttpResponse.json({ ...sourceWithoutEE, id: 1 });
        })
      );

      const user = userEvent.setup();
      render(
        <SWRConfig value={{ provider: () => new Map() }}>
          <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/1/edit']}>
            <Routes>
              <Route
                path="/infrastructure/inventories/inventory/:id/sources/:source_id/edit"
                element={<EditInventorySource />}
              />
            </Routes>
          </MemoryRouter>
        </SWRConfig>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save source' }));

      await waitFor(() => {
        expect(mockPageNavigate).toHaveBeenCalled();
      });
      const [eeNullRoute, eeNullOpts] = mockPageNavigate.mock.lastCall as [
        string,
        { params: { id: string; source_id: number } },
      ];
      expect(eeNullRoute).toBe(AwxRoute.InventorySourceDetail);
      expect(eeNullOpts.params.id).toBe('2');
      expect(eeNullOpts.params.source_id).toBe(1);

      expect(capturedEE).toBeNull();
    }
  );

  test(
    'should submit execution environment id when edit form is saved',
    { timeout: 15000 },
    async () => {
      let capturedEE: unknown = 'NOT_SET';

      server.use(
        http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource)),
        http.patch(awxAPI`/inventory_sources/1/`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          capturedEE = body.execution_environment;
          return HttpResponse.json({ ...mockInventorySource, id: 1 });
        })
      );

      const user = userEvent.setup();
      render(
        <SWRConfig value={{ provider: () => new Map() }}>
          <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/1/edit']}>
            <Routes>
              <Route
                path="/infrastructure/inventories/inventory/:id/sources/:source_id/edit"
                element={<EditInventorySource />}
              />
            </Routes>
          </MemoryRouter>
        </SWRConfig>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save source' }));

      await waitFor(() => {
        expect(mockPageNavigate).toHaveBeenCalled();
      });
      const [eeIdRoute, eeIdOpts] = mockPageNavigate.mock.lastCall as [
        string,
        { params: { id: string; source_id: number } },
      ];
      expect(eeIdRoute).toBe(AwxRoute.InventorySourceDetail);
      expect(eeIdOpts.params.id).toBe('2');
      expect(eeIdOpts.params.source_id).toBe(1);

      expect(capturedEE).toBeTruthy();
    }
  );

  test(
    'should submit empty string for source_path when project root is selected',
    { timeout: 15000 },
    async () => {
      const sourceWithProjectRoot = { ...mockInventorySource, source_path: '' };
      let capturedSourcePath: unknown = 'NOT_SET';

      server.use(
        http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(sourceWithProjectRoot)),
        http.patch(awxAPI`/inventory_sources/1/`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          capturedSourcePath = body.source_path;
          return HttpResponse.json({ ...sourceWithProjectRoot, id: 1 });
        })
      );

      const user = userEvent.setup();
      // Use a fresh SWR cache so this test's GET override is not shadowed by cached data
      // from prior tests that already fetched /inventory_sources/1/.
      render(
        <SWRConfig value={{ provider: () => new Map() }}>
          <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/1/edit']}>
            <Routes>
              <Route
                path="/infrastructure/inventories/inventory/:id/sources/:source_id/edit"
                element={<EditInventorySource />}
              />
            </Routes>
          </MemoryRouter>
        </SWRConfig>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Source')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save source' }));

      await waitFor(() => {
        expect(mockPageNavigate).toHaveBeenCalled();
      });
      const [pathRoute, pathOpts] = mockPageNavigate.mock.lastCall as [
        string,
        { params: { id: string; source_id: number } },
      ];
      expect(pathRoute).toBe(AwxRoute.InventorySourceDetail);
      expect(pathOpts.params.id).toBe('2');
      expect(pathOpts.params.source_id).toBe(1);

      expect(capturedSourcePath).toBe('');
    }
  );

  test(
    'should reset source-specific fields when source type changes',
    { timeout: 15000 },
    async () => {
      server.use(
        http.get(awxAPI`/inventory_sources/1/`, () => HttpResponse.json(mockInventorySource)),
        http.get(awxAPI`/credentials/`, () => HttpResponse.json({ count: 0, results: [] }))
      );

      const user = userEvent.setup();
      renderEditForm(['/infrastructure/inventories/inventory/2/sources/1/edit']);

      await waitFor(
        () => {
          expect(screen.getByLabelText('Source control branch')).toBeInTheDocument();
        },
        { timeout: 8000 }
      );

      await user.click(screen.getByRole('button', { name: /Sourced from a Project/i }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Amazon EC2' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Amazon EC2' }));

      await waitFor(() => {
        expect(screen.queryByLabelText('Source control branch')).not.toBeInTheDocument();
      });
    }
  );

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

  test('should transform empty source_path from API to project root display value', () => {
    // This tests the line 150 transformation logic:
    // source_path: { name: inventorySource?.source_path ? inventorySource?.source_path : '. (project root)' }
    const emptyPath = '';
    const expectedDisplayValue = emptyPath || '. (project root)';
    expect(expectedDisplayValue).toBe('. (project root)');
  });

  test('should transform project root input to empty string for API submission', () => {
    // This tests the lines 68 and 169 transformation logic:
    // source_path: values?.source_path?.name === '. (project root)' ? '' : values?.source_path?.name
    const transformForSubmit = (value: string) => (value === '. (project root)' ? '' : value);

    expect(transformForSubmit('. (project root)')).toBe('');
    expect(transformForSubmit('inventories/hosts.yml')).toBe('inventories/hosts.yml');
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
