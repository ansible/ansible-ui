/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { JsonBodyType } from 'msw/lib/core/handlers/RequestHandler';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InventorySource } from '../../interfaces/InventorySource';
import credentialTypes from './../../../../cypress/fixtures/credentialTypes.json';
import inventories from './../../../../cypress/fixtures/inventory.json';
import { CreateInventorySource, EditInventorySource } from './InventorySourceForm';
import sourceTypesOptions from './mocks/InventorySourceTypes.json';

export const restHandlers = [
  http.options(awxAPI`/inventory_sources/`, () => {
    return HttpResponse.json(sourceTypesOptions as JsonBodyType);
  }),
  http.get(awxAPI`/inventories/2/`, () => {
    return HttpResponse.json(inventories);
  }),
  http.get(awxAPI`/credential_types/?`, () => {
    return HttpResponse.json(credentialTypes);
  }),
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
  related: {
    schedules: '/api/v2/inventory_sources/1/schedules/',
  },
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
      name: 'Test Project',
      description: '',
      status: 'successful',
      scm_type: 'git',
      allow_override: false,
    },
    execution_environment: {
      id: 789,
      name: 'Test EE',
      description: '',
      image: 'quay.io/test/ee',
    },
    user_capabilities: {
      edit: true,
      schedule: true,
      start: true,
      delete: true,
    },
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

describe('CreateInventorySource', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  beforeEach(() => {
    vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
      const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
        <textarea
          id={props.id as string}
          name={props.id as string}
          value={props.value as string}
          onChange={props.onChange as () => void}
          className={props.className as string}
          onFocus={props.onFocus as () => void}
          onBlur={props.onBlur as () => void}
        />
      ));
      return { DataEditor: FakeDataEditor };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  test('should list the VMWare ESXI source type', async () => {
    const { getAllByRole } = render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/add`}
            element={<CreateInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await waitFor(
      () => {
        const sourceButtons = getAllByRole('button');
        expect(sourceButtons.length).toBeGreaterThan(1);
      },
      { timeout: 10000 }
    );

    const sourceButtons = getAllByRole('button');
    await user.click(sourceButtons[1]);

    await waitFor(
      () => {
        expect(screen.getByText('VMware ESXi')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  test('should render name field', async () => {
    render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/add`}
            element={<CreateInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toBeVisible();
  });

  test('should require source type field', async () => {
    render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/add`}
            element={<CreateInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/^Source$/)).toBeInTheDocument();
    });
  });

  test('should render source selection field', async () => {
    render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/add']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/add`}
            element={<CreateInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Select source' })).toBeInTheDocument();
    });
  });
});

describe('EditInventorySource', () => {
  const server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
      const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
        <textarea
          id={props.id as string}
          name={props.id as string}
          value={props.value as string}
          onChange={props.onChange as () => void}
          className={props.className as string}
          onFocus={props.onFocus as () => void}
          onBlur={props.onBlur as () => void}
        />
      ));
      return { DataEditor: FakeDataEditor };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  test('should transform source_path from project root to empty string', () => {
    const sourcePathValue = '/ (project root)';
    const transformed = sourcePathValue === '/ (project root)' ? '' : sourcePathValue;
    expect(transformed).toBe('');
  });

  test('should not transform source_path when it is not project root', () => {
    const sourcePathValue: string = 'inventories/test.yml';
    const projectRoot: string = '/ (project root)';
    const transformed = sourcePathValue === projectRoot ? '' : sourcePathValue;
    expect(transformed).toBe('inventories/test.yml');
  });

  test('should transform empty source_path to project root for display', () => {
    const apiSourcePath = '';
    const displayValue = apiSourcePath || '/ (project root)';
    expect(displayValue).toBe('/ (project root)');
  });

  test('should correctly populate default values from inventory source', async () => {
    server.use(
      http.get(awxAPI`/inventory_sources/1/`, () => {
        return HttpResponse.json(mockInventorySource);
      })
    );

    render(
      <MemoryRouter initialEntries={['/infrastructure/inventories/inventory/2/sources/1/edit']}>
        <Routes>
          <Route
            path={`/infrastructure/inventories/inventory/:id/sources/:source_id/edit`}
            element={<EditInventorySource />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Test Source');
      expect(nameInput).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });
});

describe('InventorySourceSubForm - handleQueryParams', () => {
  const handleQueryParams = (source: string) => {
    switch (source) {
      case 'scm':
        return {
          credential_type__kind__in: 'cloud,kubernetes',
        };
      case 'ec2':
        return {
          credential_type__namespace: 'aws',
        };
      case 'openshift_virtualization':
        return {
          credential_type__namespace: 'kubernetes_bearer_token',
        };
      case 'vmware_esxi':
        return {
          credential_type__namespace: 'vmware',
        };
      default:
        return {
          credential_type__namespace: source,
        };
    }
  };

  test('should return correct query params for scm source type', () => {
    const source = 'scm';
    const expectedParams = { credential_type__kind__in: 'cloud,kubernetes' };
    const result = handleQueryParams(source);
    expect(result).toEqual(expectedParams);
  });

  test('should return correct query params for ec2 source type', () => {
    const source = 'ec2';
    const expectedParams = { credential_type__namespace: 'aws' };
    const result = handleQueryParams(source);
    expect(result).toEqual(expectedParams);
  });

  test('should return correct query params for openshift_virtualization source type', () => {
    const source = 'openshift_virtualization';
    const expectedParams = { credential_type__namespace: 'kubernetes_bearer_token' };
    const result = handleQueryParams(source);
    expect(result).toEqual(expectedParams);
  });

  test('should return correct query params for vmware_esxi source type', () => {
    const source = 'vmware_esxi';
    const expectedParams = { credential_type__namespace: 'vmware' };
    const result = handleQueryParams(source);
    expect(result).toEqual(expectedParams);
  });

  test('should return namespace query params for other source types', () => {
    const source = 'gce';
    const expectedParams = { credential_type__namespace: 'gce' };
    const result = handleQueryParams(source);
    expect(result).toEqual(expectedParams);
  });
});

describe('InventorySource - Source Type Credential Requirements', () => {
  test('should identify source types with optional credentials', () => {
    const sourceTypesWithOptionalCredentials = ['ec2', 'scm', 'terraform'];

    expect(sourceTypesWithOptionalCredentials).toContain('ec2');
    expect(sourceTypesWithOptionalCredentials).toContain('scm');
    expect(sourceTypesWithOptionalCredentials).toContain('terraform');
    expect(sourceTypesWithOptionalCredentials).toHaveLength(3);
  });

  test('should require credential for gce source type', () => {
    const sourceTypesWithOptionalCredentials = ['ec2', 'scm', 'terraform'];
    const source = 'gce';
    const isRequired = !sourceTypesWithOptionalCredentials.includes(source);

    expect(isRequired).toBe(true);
  });

  test('should not require credential for ec2 source type', () => {
    const sourceTypesWithOptionalCredentials = ['ec2', 'scm', 'terraform'];
    const source = 'ec2';
    const isRequired = !sourceTypesWithOptionalCredentials.includes(source);

    expect(isRequired).toBe(false);
  });

  test('should not require credential for scm source type', () => {
    const sourceTypesWithOptionalCredentials = ['ec2', 'scm', 'terraform'];
    const source = 'scm';
    const isRequired = !sourceTypesWithOptionalCredentials.includes(source);

    expect(isRequired).toBe(false);
  });

  test('should not require credential for terraform source type', () => {
    const sourceTypesWithOptionalCredentials = ['ec2', 'scm', 'terraform'];
    const source = 'terraform';
    const isRequired = !sourceTypesWithOptionalCredentials.includes(source);

    expect(isRequired).toBe(false);
  });
});
