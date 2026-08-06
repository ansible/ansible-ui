/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ManageResourceRoles } from './ManageResourceRoles';

const mockRoleDefinitions = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 10,
      name: 'Project Admin',
      description: 'Full project access',
      url: '/api/gateway/v1/role_definitions/10/',
      managed: true,
      content_type: 'awx.project',
      permissions: ['awx.change_project', 'awx.delete_project', 'awx.view_project'],
    },
    {
      id: 11,
      name: 'Project Auditor',
      description: 'Read-only project access',
      url: '/api/gateway/v1/role_definitions/11/',
      managed: true,
      content_type: 'awx.project',
      permissions: ['awx.view_project'],
    },
  ],
};

const mockRoleAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 100,
      role_definition: 10,
      user: 42,
      content_type: 'awx.project',
      object_id: '5',
    },
  ],
};

const mockUser: import('@ansible/platform-ui/interfaces/PlatformUser').PlatformUser = {
  id: 42,
  url: '/api/gateway/v1/users/42/',
  username: 'alice',
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@example.com',
  created: '2024-01-01T00:00:00Z',
  created_by: 'admin',
  modified: '2024-01-01T00:00:00Z',
  modified_by: 'admin',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User' },
    created_by: { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User' },
    resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
  },
  is_superuser: false,
  is_platform_auditor: false,
  last_login_map_results: [],
  managed: false,
};

const mockResource = {
  id: '5',
  name: 'Demo Project',
  summary_fields: {
    organization: { id: '1', name: 'Default' },
  },
};

describe('ManageResourceRoles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/resources/project/5/users/42/roles']}>
        <Routes>
          <Route
            path="/resources/:resource_type/:resource_id/users/:user_id/roles"
            element={<ManageResourceRoles resource={mockResource} user={mockUser} />}
          />
        </Routes>
      </MemoryRouter>
    );

  it('should render the save roles button', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      ),
      http.get('*/users/*/teams/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Save roles')).toBeInTheDocument();
    });
  });

  it('should render cancel button', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      ),
      http.get('*/users/*/teams/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should display user-specific text for role assignment', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      ),
      http.get('*/users/*/teams/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Selected roles will be directly assigned to alice/)
      ).toBeInTheDocument();
    });
  });

  it('should render selected roles label', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments)),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      ),
      http.get('*/users/*/teams/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Selected roles')).toBeInTheDocument();
    });
  });
});
