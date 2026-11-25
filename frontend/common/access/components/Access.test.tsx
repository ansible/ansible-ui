/* eslint-disable i18next/no-literal-string */
import { ColumnPriority } from '@ansible/ansible-ui-framework';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';

const mockUserAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 10,
      summary_fields: {
        role_definition: { id: 1, name: 'Project Admin', description: '', managed: true },
        user: { id: 2, username: 'alice', email: '', first_name: 'Alice', last_name: 'Lee' },
      },
    },
  ],
};

const mockTeamAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 11,
      summary_fields: {
        role_definition: { id: 2, name: 'Credential Admin', description: '', managed: true },
        team: { id: 4, name: 'Platform Team' },
      },
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('Access', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders user assignments for the user access list type', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserAssignments)));

    render(
      <MemoryRouter initialEntries={['/resources/5/access']}>
        <Routes>
          <Route
            path="/resources/:id/access"
            element={
              <Access<UserAssignment>
                service="awx"
                id="5"
                url="/api/controller/v2/role_user_assignments/"
                content_type_model="project"
                accessListType="user"
                toolbarNameColumnFiltersValues={{ label: 'Username', query: 'user__username' }}
                addRolesRoute="assign-users"
                tableColumnFunctions={{
                  name: {
                    label: 'Username',
                    sort: 'user__username',
                    function: (item) => item.summary_fields.user?.username ?? '',
                  },
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
    expect(screen.getByText('Project Admin')).toBeInTheDocument();
  });

  it('renders team assignments and team-specific empty state copy', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter initialEntries={['/resources/9/access']}>
        <Routes>
          <Route
            path="/resources/:id/access"
            element={
              <Access<TeamAssignment>
                service="eda"
                id="9"
                url="/api/eda/v1/role_team_assignments/"
                content_type_model="activation"
                accessListType="team"
                addRolesRoute="assign-teams"
                addRoleButtonText="Assign teams"
                tableColumnFunctions={{
                  name: {
                    label: 'Team name',
                    sort: 'team__name',
                    function: (item) => item.summary_fields.team?.name ?? '',
                  },
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No teams are assigned to this rulebook activation/)
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/To get started, assign a team to this rulebook activation/)
    ).toBeInTheDocument();
  });

  it.each([
    ['awx', /Automation Execution roles assigned to this user/],
    ['eda', /Automation Decisions roles assigned to this user/],
    ['hub', /Automation Content roles assigned to this user/],
  ] as const)(
    'shows service-specific empty state for %s user-roles',
    async (service, emptyPattern) => {
      server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

      render(
        <MemoryRouter initialEntries={['/users/3/roles']}>
          <Routes>
            <Route
              path="/users/:id/roles"
              element={
                <Access<UserAssignment>
                  service={service}
                  id="3"
                  url={`/${service}/role_user_assignments/`}
                  accessListType="user-roles"
                  tableColumnFunctions={{
                    name: { label: 'Resource', function: () => 'resource' },
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(emptyPattern)).toBeInTheDocument();
      });
    }
  );

  it('shows team-roles empty state and applies additional column ordering', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments)));

    render(
      <MemoryRouter initialEntries={['/teams/7/roles']}>
        <Routes>
          <Route
            path="/teams/:id/roles"
            element={
              <Access<TeamAssignment>
                service="hub"
                id="7"
                url="/api/galaxy/_ui/v2/role_team_assignments/"
                accessListType="team-roles"
                additionalTableColumns={[
                  {
                    header: 'Priority column',
                    type: 'text',
                    value: () => 'first',
                    priority: ColumnPriority.last,
                  },
                  {
                    header: 'Extra column',
                    type: 'text',
                    value: () => 'extra',
                  },
                ]}
                tableColumnFunctions={{
                  name: {
                    label: 'Team',
                    function: (item) => item.summary_fields.team?.name ?? '',
                  },
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Platform Team')).toBeInTheDocument();
    });
    expect(screen.getByText('Extra column')).toBeInTheDocument();
    expect(screen.getByText('Credential Admin')).toBeInTheDocument();
  });

  it('uses custom remove confirmation text when provided for team resources', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments)));

    render(
      <MemoryRouter initialEntries={['/teams/2/access']}>
        <Routes>
          <Route
            path="/teams/:id/access"
            element={
              <Access<TeamAssignment>
                service="awx"
                id="2"
                url="/api/controller/v2/role_team_assignments/"
                content_type_model="team"
                accessListType="user"
                removeConfirmationText={(count) => `Remove ${count} team memberships`}
                tableColumnFunctions={{
                  name: { label: 'User', function: () => 'user-one' },
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user-one')).toBeInTheDocument();
    });
  });
});
