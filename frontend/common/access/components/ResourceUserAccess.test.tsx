/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ResourceUserAccess } from './ResourceUserAccess';

const mockUserRoleAccess = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: '1',
      url: '/api/v2/users/1/',
      related: { details: '/api/gateway/v1/role_user_access/awx.project/5/abc-def/' },
      username: 'projectadmin',
      is_superuser: false,
      object_role_assignments: [
        {
          type: 'direct',
          role_definition: {
            name: 'Project Admin',
            url: '/api/gateway/v1/role_definitions/10/',
          },
        },
      ],
      first_name: 'Project',
      last_name: 'Admin',
    },
  ],
};

const mockSuperuserAccess = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: '2',
      url: '/api/v2/users/2/',
      related: { details: '/api/gateway/v1/role_user_access/awx.project/5/xyz-123/' },
      username: 'superadmin',
      is_superuser: true,
      object_role_assignments: [],
      first_name: 'Super',
      last_name: 'Admin',
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockRoleDefinitions = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 10, name: 'Project Admin', url: '/api/gateway/v1/role_definitions/10/' }],
};

describe('ResourceUserAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderWithRoute = (props: Parameters<typeof ResourceUserAccess>[0]) =>
    render(
      <MemoryRouter initialEntries={['/resources/5/user-access']}>
        <Routes>
          <Route path="/resources/:id/user-access" element={<ResourceUserAccess {...props} />} />
        </Routes>
      </MemoryRouter>
    );

  it('should render user access with username and roles', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockUserRoleAccess)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(screen.getByText('projectadmin')).toBeInTheDocument();
    });
  });

  it('should display first name and last name columns', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockUserRoleAccess)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(screen.getByText('projectadmin')).toBeInTheDocument();
    });
    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('Last name')).toBeInTheDocument();
  });

  it('should show AAP Administrator label for superusers', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockSuperuserAccess)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(screen.getByText('AAP Administrator')).toBeInTheDocument();
    });
  });

  it('should render info alert about team member roles', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockEmptyResults)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(
        screen.getByText(/Below displays a list of users with access to this resource/)
      ).toBeInTheDocument();
    });
  });

  it('should display empty state when no users have access', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockEmptyResults)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(screen.getByText(/No users assigned/)).toBeInTheDocument();
    });
  });

  it('should render for EDA service', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockUserRoleAccess)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'eda', id: '5', type: 'activation' });

    await waitFor(() => {
      expect(screen.getByText('projectadmin')).toBeInTheDocument();
    });
  });

  it('should render Assign users button text', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockEmptyResults)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    renderWithRoute({ service: 'awx', id: '5', type: 'project' });

    await waitFor(() => {
      expect(screen.getByText('Assign users')).toBeInTheDocument();
    });
  });
});
