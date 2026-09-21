/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformOrganizationForm } from './PlatformOrganizationForm';

const mockNavigate = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

vi.mock('../../../main/GatewayServices', () => ({
  useHasAwxService: () => true,
}));

const mockPlatformOrganization: PlatformOrganization = {
  id: 1,
  name: 'Test Organization',
  description: 'Test Description',
  url: '/api/v2/organizations/1/',
  created: '2024-01-01T00:00:00Z',
  created_by: 1,
  modified: '2024-01-01T00:00:00Z',
  modified_by: 1,
  managed: false,
  related: {
    created_by: '/api/v2/users/1/',
    modified_by: '/api/v2/users/1/',
    teams: '/api/v2/organizations/1/teams/',
  },
  summary_fields: {
    resource: {
      ansible_id: 'ansible-123',
      resource_type: 'organization',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
  },
};

const mockControllerOrganization: ControllerOrganization = {
  id: 100,
  name: 'Test Organization',
  max_hosts: 100,
  opa_query_path: '/path/to/policy',
  url: '/api/v2/organizations/100/',
  type: 'organization',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  related: {},
  summary_fields: {
    resource: {
      ansible_id: 'ansible-123',
      resource_type: 'shared.organization',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    object_roles: {
      admin_role: { id: 1, name: 'Admin', description: '' },
      execute_role: { id: 2, name: 'Execute', description: '' },
      project_admin_role: { id: 3, name: 'Project Admin', description: '' },
      inventory_admin_role: { id: 4, name: 'Inventory Admin', description: '' },
      credential_admin_role: { id: 5, name: 'Credential Admin', description: '' },
      workflow_admin_role: { id: 6, name: 'Workflow Admin', description: '' },
      notification_admin_role: { id: 7, name: 'Notification Admin', description: '' },
      job_template_admin_role: { id: 8, name: 'Job Template Admin', description: '' },
      execution_environment_admin_role: {
        id: 9,
        name: 'Execution Environment Admin',
        description: '',
      },
      auditor_role: { id: 10, name: 'Auditor', description: '' },
      member_role: { id: 11, name: 'Member', description: '' },
      read_role: { id: 12, name: 'Read', description: '' },
      approval_role: { id: 13, name: 'Approval', description: '' },
    },
    user_capabilities: {
      edit: true,
      delete: true,
    },
    related_field_counts: {
      inventories: 0,
      teams: 0,
      users: 0,
      job_templates: 0,
      admins: 0,
      projects: 0,
    },
  },
};

const server = setupServer(
  http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockPlatformOrganization)),
  http.get(awxAPI`/organizations/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('resource__ansible_id') === 'ansible-123') {
      return HttpResponse.json({
        count: 1,
        results: [mockControllerOrganization],
        next: null,
        previous: null,
      });
    }
    return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
  }),
  http.options(gatewayAPI`/organizations/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
          },
        },
      },
    })
  ),
  http.options(awxAPI`/organizations/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          max_hosts: {
            type: 'integer',
            required: false,
            read_only: false,
            label: 'Max Hosts',
          },
          opa_query_path: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'OPA Query Path',
            pattern: '^[a-z0-9_./]*$',
            pattern_description: 'Policy enforcement path must be lowercase alphanumeric.',
          },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

describe('PlatformOrganizationForm', () => {
  it('exports the PlatformOrganizationForm component', () => {
    expect(PlatformOrganizationForm).toBeDefined();
    expect(typeof PlatformOrganizationForm).toBe('function');
  });

  it('should pre-fill the Policy enforcement field from the controller organization', async () => {
    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          organization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={vi.fn()}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Policy enforcement/i })).toHaveValue(
        '/path/to/policy'
      );
    });
  });

  it('should apply the pattern validation merged in from the awx OPTIONS response', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          organization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={vi.fn()}
        />
      </MemoryRouter>
    );

    const input = await screen.findByRole('textbox', { name: /Policy enforcement/i });
    await user.clear(input);
    await user.type(input, 'INVALID PATH');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Policy enforcement path must be lowercase alphanumeric.')
      ).toBeInTheDocument();
    });
  });

  it('should render the form without the opa_query_path pattern when the awx OPTIONS response is unavailable', async () => {
    server.use(
      http.options(awxAPI`/organizations/`, () =>
        HttpResponse.json({ actions: {} }, { status: 404 })
      )
    );
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PlatformOrganizationForm
          organization={mockPlatformOrganization}
          controllerOrganization={mockControllerOrganization}
          handleSubmit={vi.fn()}
        />
      </MemoryRouter>
    );

    const input = await screen.findByRole('textbox', { name: /Policy enforcement/i });
    await user.clear(input);
    await user.type(input, 'INVALID PATH');
    await user.tab();

    expect(
      screen.queryByText('Policy enforcement path must be lowercase alphanumeric.')
    ).not.toBeInTheDocument();
  });

  test('validates organization name from OPTIONS endpoint', async () => {
    server.use(
      http.options(gatewayAPI`/organizations/`, () =>
        HttpResponse.json({
          actions: {
            POST: {
              name: {
                pattern: String.raw`^[a-zA-Z0-9_\-\s]+$`,
                patternDescription: 'Name must contain only letters, numbers, underscores, hyphens, and spaces.',
              },
            },
          },
        })
      )
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/access/organizations/create']}>
        <Routes>
          <Route path="/access/organizations/create" element={<CreatePlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'invalid@org!');
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.getByText(/Name must contain only letters, numbers, underscores, hyphens, and spaces\./)
      ).toBeInTheDocument();
    });
  });

  test('accepts valid organization name matching OPTIONS pattern', async () => {
    server.use(
      http.options(gatewayAPI`/organizations/`, () =>
        HttpResponse.json({
          actions: {
            POST: {
              name: {
                pattern: String.raw`^[a-zA-Z0-9_\-\s]+$`,
                patternDescription: 'Name must contain only letters, numbers, underscores, hyphens, and spaces.',
              },
            },
          },
        })
      )
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/access/organizations/create']}>
        <Routes>
          <Route path="/access/organizations/create" element={<CreatePlatformOrganization />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Valid_Organization-Name 123');
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText(/must contain only/)).not.toBeInTheDocument();
    });
  });
});
