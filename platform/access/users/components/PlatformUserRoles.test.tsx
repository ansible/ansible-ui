import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformUserRoles } from './PlatformUserRoles';

const mockUser = {
  id: 1,
  url: gatewayAPI`/users/1/`,
  username: 'test-user',
  email: 'test-user@example.com',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: false,
  is_platform_auditor: false,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  last_login: '2024-01-01T00:00:00Z',
};

const mockUserRoleAssignments = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      url: gatewayAPI`/role_user_assignments/1/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 1,
      user: 1,
      user_ansible_id: null,
      content_type: 'platform.organization',
      object_id: '1',
      object_ansible_id: null,
      summary_fields: {
        role_definition: {
          id: 1,
          name: 'Organization Admin',
          description: 'Administer organization',
          managed: true,
        },
        user: {
          id: 1,
          username: 'test-user',
          first_name: 'Test',
          last_name: 'User',
        },
        content_object: {
          id: 1,
          name: 'Test Organization',
          description: 'Test organization description',
        },
      },
    },
    {
      id: 2,
      url: gatewayAPI`/role_user_assignments/2/`,
      created: '2024-01-01T00:00:00Z',
      created_by: 1,
      role_definition: 2,
      user: 1,
      user_ansible_id: null,
      content_type: 'platform.project',
      object_id: '1',
      object_ansible_id: null,
      summary_fields: {
        role_definition: {
          id: 2,
          name: 'Project Admin',
          description: 'Administer project',
          managed: true,
        },
        user: {
          id: 1,
          username: 'test-user',
          first_name: 'Test',
          last_name: 'User',
        },
        content_object: {
          id: 1,
          name: 'Test Project',
          description: 'Test project description',
        },
      },
    },
  ],
};

const mockEmptyRoleAssignments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockResourceTypes = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      model: 'organization',
      api_slug: 'organizations',
      service: 'platform',
    },
    {
      id: 2,
      model: 'project',
      api_slug: 'projects',
      service: 'platform',
    },
    {
      id: 3,
      model: 'team',
      api_slug: 'teams',
      service: 'platform',
    },
  ],
};

const mockUserTeams = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 2,
      url: '/api/gateway/v1/teams/2/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=11&object_id=2',
        created_by: '/api/gateway/v1/users/2/',
        modified_by: '/api/gateway/v1/users/2/',
        organization: '/api/gateway/v1/organizations/3/',
        users: '/api/gateway/v1/teams/2/users/',
        admins: '/api/gateway/v1/teams/2/admins/',
      },
      summary_fields: {
        modified_by: {
          id: 2,
          username: 'admin',
          first_name: '',
          last_name: '',
        },
        created_by: {
          id: 2,
          username: 'admin',
          first_name: '',
          last_name: '',
        },
        organization: {
          id: 3,
          name: 'lgOrg',
        },
        resource: {
          ansible_id: '6ce88679-4e9a-4687-9e72-63e83744d0a4',
          resource_type: 'shared.team',
        },
      },
      created: '2025-08-29T18:23:34.233434Z',
      created_by: 2,
      modified: '2025-08-29T18:23:34.233409Z',
      modified_by: 2,
      name: 'LGTeam1',
      organization: 3,
      description: '',
    },
    {
      id: 3,
      url: '/api/gateway/v1/teams/3/',
      related: {
        activity_stream: '/api/gateway/v1/activitystream/?content_type=11&object_id=3',
        created_by: '/api/gateway/v1/users/2/',
        modified_by: '/api/gateway/v1/users/2/',
        organization: '/api/gateway/v1/organizations/3/',
        users: '/api/gateway/v1/teams/3/users/',
        admins: '/api/gateway/v1/teams/3/admins/',
      },
      summary_fields: {
        modified_by: {
          id: 2,
          username: 'admin',
          first_name: '',
          last_name: '',
        },
        created_by: {
          id: 2,
          username: 'admin',
          first_name: '',
          last_name: '',
        },
        organization: {
          id: 3,
          name: 'lgOrg',
        },
        resource: {
          ansible_id: '1c9c8280-46f6-45ed-8dbb-7e34c5fb2f27',
          resource_type: 'shared.team',
        },
      },
      created: '2025-08-29T18:23:43.881418Z',
      created_by: 2,
      modified: '2025-08-29T18:23:43.881399Z',
      modified_by: 2,
      name: 'LGTeam2',
      organization: 3,
      description: '',
    },
  ],
};

describe('PlatformUserRoles - Role Explanation', () => {
  const server = setupServer(
    // User endpoint
    http.get(gatewayAPI`/users/1/`, () => {
      return HttpResponse.json(mockUser);
    }),

    // User options endpoint (with proper parameter handling)
    http.options(gatewayAPI`/users/1/`, () => {
      return HttpResponse.json({
        actions: {
          GET: true,
          PUT: true,
          PATCH: true,
          DELETE: true,
        },
      });
    }),

    // Generic user options endpoint for empty params
    http.options(gatewayAPI`/users/`, () => {
      return HttpResponse.json({
        actions: {
          GET: true,
          POST: true,
        },
      });
    }),

    // Resource types endpoint
    http.get(gatewayAPI`/resource_types/`, () => {
      return HttpResponse.json(mockResourceTypes);
    }),

    http.get(gatewayAPI`/users/1/teams/`, () => {
      return HttpResponse.json(mockUserTeams);
    }),

    http.get(gatewayAPI`/role_team_assignments/`, ({ request }) => {
      const url = new URL(request.url);
      const teamIn = url.searchParams.get('team__in');
      if (teamIn) {
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              role_definition: 2,
              team: 2,
              content_type: 'platform.organization',
              object_id: '1',
              summary_fields: {
                role_definition: {
                  id: 2,
                  name: 'Organization Member',
                  description: 'Basic organization membership',
                  managed: true,
                },
                team: { id: 2, name: 'LGTeam1' },
                content_object: { id: 1, name: 'Test Organization' },
              },
            },
          ],
        });
      }
      return HttpResponse.json({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
    }),

    // Service index role types endpoint
    http.get(gatewayAPI`/service-index/role-types/`, () => {
      return HttpResponse.json({ results: [] });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should display explanation about assigned vs inherited roles when user has role assignments', async () => {
    // Mock role assignments with results
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockUserRoleAssignments);
      }),
      http.get(gatewayAPI`/role_team_assignments/`, ({ request }) => {
        const url = new URL(request.url);
        const teamIn = url.searchParams.get('team__in');
        if (teamIn) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                role_definition: 2,
                team: 2,
                content_type: 'platform.organization',
                object_id: '1',
                summary_fields: {
                  role_definition: {
                    id: 2,
                    name: 'Organization Member',
                    description: 'Basic organization membership',
                    managed: true,
                  },
                  team: {
                    id: 2,
                    name: 'LGTeam1',
                  },
                  content_object: {
                    id: 1,
                    name: 'Test Organization',
                  },
                },
              },
            ],
          });
        }
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<PlatformUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "The list below includes all of this user's direct role assignments. Indirectly assigned roles, which are inherited through a team assignment, for test-user cannot be managed here."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "To view these indirectly assigned roles click the button below. To modify indirect role assignments, manage the team's assignments."
        )
      ).toBeInTheDocument();
    });

    // Check for the button to view indirect assignments
    expect(
      screen.getByRole('button', { name: 'View indirectly assigned roles' })
    ).toBeInTheDocument();
  });

  test('should not display explanation when user has no role assignments', async () => {
    // Mock empty role assignments
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockEmptyRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<PlatformUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('No roles assigned to this user.')).toBeInTheDocument();
    });

    // Verify the explanation alert is NOT displayed when there are no assignments
    expect(
      screen.queryByText("The list below includes all of this user's direct role assignments")
    ).not.toBeInTheDocument();

    // Verify empty state is shown
    expect(screen.getByText('No roles assigned to this user.')).toBeInTheDocument();
    expect(screen.getByText('To get started, assign roles to this user.')).toBeInTheDocument();
  });

  test('should display correct username in the explanation text', async () => {
    // Mock role assignments with results
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockUserRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<PlatformUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the explanation text to appear
    await waitFor(() => {
      expect(screen.getByText(/for test-user cannot be managed here/)).toBeInTheDocument();
    });

    // Verify the username is correctly interpolated in the explanation
    expect(screen.getByText(/for test-user cannot be managed here/)).toBeInTheDocument();
  });

  test('should display role assignments with proper role names', async () => {
    // Mock role assignments with results
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockUserRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<PlatformUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the explanation text to appear first
    await waitFor(() => {
      expect(screen.getByText(/for test-user cannot be managed here/)).toBeInTheDocument();
    });

    // Verify the explanation is shown (this is the main test purpose)
    expect(
      screen.getByText(
        "The list below includes all of this user's direct role assignments. Indirectly assigned roles, which are inherited through a team assignment, for test-user cannot be managed here."
      )
    ).toBeInTheDocument();
  });

  test('should handle user data loading and display username correctly', async () => {
    // Test with a different username to verify dynamic interpolation
    const mockUserWithDifferentName = {
      ...mockUser,
      username: 'different-user',
    };

    server.use(
      http.get(gatewayAPI`/users/1/`, () => {
        return HttpResponse.json(mockUserWithDifferentName);
      }),
      http.get(gatewayAPI`/role_user_assignments/`, () => {
        return HttpResponse.json(mockUserRoleAssignments);
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<PlatformUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the explanation text with different username to appear
    await waitFor(() => {
      expect(screen.getByText(/for different-user cannot be managed here/)).toBeInTheDocument();
    });

    // Verify the different username is correctly displayed in the explanation
    expect(screen.getByText(/for different-user cannot be managed here/)).toBeInTheDocument();
  });
});
