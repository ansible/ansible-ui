import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock,
} from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformTeamRoles } from './PlatformTeamRoles';

const { defaultResourceTypesData, mockUseGetResourceTypes } = vi.hoisted(
  (): {
    defaultResourceTypesData: {
      count: number;
      next: null;
      previous: null;
      results: { id: number; model: string; api_slug: string; service: string }[];
    };
    mockUseGetResourceTypes: Mock<
      () => {
        data: {
          count: number;
          next: null;
          previous: null;
          results: { id: number; model: string; api_slug: string; service: string }[];
        };
        error: undefined;
        isLoading: boolean;
      }
    >;
  } => {
    const data = {
      count: 3,
      next: null as null,
      previous: null as null,
      results: [
        {
          id: 1,
          model: 'project',
          api_slug: 'projects',
          service: 'awx',
        },
        {
          id: 2,
          model: 'project',
          api_slug: 'projects',
          service: 'eda',
        },
        {
          id: 3,
          model: 'namespace',
          api_slug: 'namespaces',
          service: 'galaxy',
        },
      ],
    };
    return {
      defaultResourceTypesData: data,
      mockUseGetResourceTypes: vi.fn(() => ({
        data,
        error: undefined,
        isLoading: false,
      })),
    };
  }
);

vi.mock('../../roles/hooks/useResourceType', () => ({
  useGetResourceTypes: () => mockUseGetResourceTypes(),
}));

const { mockUseParams } = vi.hoisted(() => ({
  mockUseParams: vi.fn<() => { id: string | undefined }>(() => ({ id: '1' })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

const mockTeam = {
  id: 1,
  url: gatewayAPI`/teams/1/`,
  name: 'Test Team',
  description: 'Test team description',
  organization: 1,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
};

const mockTeamRoleAssignments = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      url: gatewayAPI`/role_team_assignments/1/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 1,
      team: 1,
      team_ansible_id: null,
      content_type: 'awx.project',
      object_id: '1',
      object_ansible_id: null,
      summary_fields: {
        role_definition: {
          id: 1,
          name: 'Project Admin',
          description: 'Administer project',
          managed: true,
        },
        team: {
          id: 1,
          name: 'Test Team',
        },
        content_object: {
          id: 1,
          name: 'Test AWX Project',
          description: 'Test project description',
        },
      },
    },
    {
      id: 2,
      url: gatewayAPI`/role_team_assignments/2/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 2,
      team: 1,
      team_ansible_id: null,
      content_type: 'eda.project',
      object_id: '2',
      object_ansible_id: null,
      summary_fields: {
        role_definition: {
          id: 2,
          name: 'Project Editor',
          description: 'Edit project',
          managed: true,
        },
        team: {
          id: 1,
          name: 'Test Team',
        },
        content_object: {
          id: 2,
          name: 'Test EDA Project',
          description: 'Test EDA project description',
        },
      },
    },
    {
      id: 3,
      url: gatewayAPI`/role_team_assignments/3/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 3,
      team: 1,
      team_ansible_id: null,
      content_type: 'galaxy.namespace',
      object_id: '3',
      object_ansible_id: null,
      summary_fields: {
        role_definition: {
          id: 3,
          name: 'Namespace Admin',
          description: 'Administer namespace',
          managed: true,
        },
        team: {
          id: 1,
          name: 'Test Team',
        },
        content_object: {
          id: 3,
          name: 'Test Galaxy Namespace',
          description: 'Test namespace description',
        },
      },
    },
  ],
};

const mockEmptyTeamRoleAssignments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('PlatformTeamRoles', () => {
  const server = setupServer(
    // Team endpoint
    http.get(gatewayAPI`/teams/1/`, () => {
      return HttpResponse.json(mockTeam);
    }),

    // Team options endpoint
    http.options(gatewayAPI`/teams/1/`, () => {
      return HttpResponse.json({
        actions: {
          GET: true,
          PUT: true,
          PATCH: true,
          DELETE: true,
        },
      });
    }),

    // Teams options endpoint (fallback for empty ID)
    http.options(gatewayAPI`/teams//`, () => {
      return HttpResponse.json({
        actions: { GET: true, PUT: true, PATCH: true },
      });
    }),

    // AWX project endpoint
    http.get('/api/v2/projects/:id/', () => {
      return HttpResponse.json({ id: 1, name: 'Test AWX Project' });
    }),

    // EDA project endpoint (undefined prefix fallback)
    http.get('/undefined/projects/:id/', () => {
      return HttpResponse.json({ id: 2, name: 'Test EDA Project' });
    }),

    // Hub namespace endpoint (undefined prefix fallback)
    http.get('/undefined/pulp/api/v3/pulp_ansible/namespaces/:id/', () => {
      return HttpResponse.json({ id: 3, name: 'Test Galaxy Namespace' });
    }),

    // Service index role types endpoint
    http.get(gatewayAPI`/service-index/role-types/`, () => {
      return HttpResponse.json({ results: [] });
    }),

    // Default role team assignments endpoint (no filters)
    http.get(gatewayAPI`/role_team_assignments/`, ({ request }) => {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('team_id');
      const serviceFilter = url.searchParams.get('content_type__service');

      if (teamId && teamId !== '1') {
        return HttpResponse.json({ count: 0, results: [] });
      }

      // If no service filter, return all assignments
      if (!serviceFilter) {
        return HttpResponse.json(mockTeamRoleAssignments);
      }

      // Filter by component/service
      const filteredResults = mockTeamRoleAssignments.results.filter((assignment) => {
        const service = assignment.content_type.split('.')[0];
        return service === serviceFilter;
      });

      return HttpResponse.json({
        count: filteredResults.length,
        next: null,
        previous: null,
        results: filteredResults,
      });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseGetResourceTypes.mockImplementation(() => ({
      data: defaultResourceTypesData,
      error: undefined,
      isLoading: false,
    }));
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test('should display all team roles when no component filter is applied', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the table to load and verify role names are displayed
    await waitFor(() => {
      expect(screen.getByText('Project Admin')).toBeInTheDocument();
      expect(screen.getByText('Project Editor')).toBeInTheDocument();
      expect(screen.getByText('Namespace Admin')).toBeInTheDocument();
    });

    // Verify the table contains all three role assignments
    const rows = screen.getAllByRole('row');
    // Header row + 3 data rows = 4 total rows
    expect(rows).toHaveLength(4);
  });

  test('should show empty state when team has no role assignments', async () => {
    // Mock empty role assignments
    server.use(
      http.get(gatewayAPI`/role_team_assignments/`, () => {
        return HttpResponse.json(mockEmptyTeamRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for component to load and verify empty state
    await waitFor(() => {
      expect(screen.getByText('No roles assigned to this team')).toBeInTheDocument();
    });

    // Verify empty state description
    expect(
      screen.getByText(
        'To get started, assign roles to this team. All users assigned to this team will inherit these roles.'
      )
    ).toBeInTheDocument();
  });

  test('should show component filter is available', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for component to load and verify filter is present
    await waitFor(() => {
      expect(screen.getByText('Select component')).toBeInTheDocument();
    });

    // Verify the filter dropdown is present
    const componentFilterButton = screen.getByText('Select component').closest('button');
    expect(componentFilterButton).toBeInTheDocument();
  });

  test('renders when resource types response has no results', async () => {
    mockUseGetResourceTypes.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      error: undefined,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Admin')).toBeInTheDocument();
    });
  });

  test('renders when resource types data is undefined', async () => {
    mockUseGetResourceTypes.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Admin')).toBeInTheDocument();
    });
  });

  test('uses empty string team id when route param is missing', async () => {
    mockUseParams.mockReturnValue({ id: undefined });

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Select component')).toBeInTheDocument();
    });
  });

  test('should show read-only empty state when team cannot be edited', async () => {
    server.use(
      http.options(gatewayAPI`/teams/1/`, () =>
        HttpResponse.json({
          actions: { GET: true },
        })
      )
    );

    server.use(
      http.get(gatewayAPI`/role_team_assignments/`, () => {
        return HttpResponse.json(mockEmptyTeamRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to assign a role to this team.')
      ).toBeInTheDocument();
    });
  });

  test('should show AwxError when team OPTIONS fails', async () => {
    server.use(http.options(gatewayAPI`/teams/1/`, () => HttpResponse.json({}, { status: 500 })));

    render(
      <MemoryRouter initialEntries={['/teams/1/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<PlatformTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 4 })).toBeInTheDocument();
  });
});
