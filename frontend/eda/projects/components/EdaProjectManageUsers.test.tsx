/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EdaProjectManageUsers } from './EdaProjectManageUsers';

const mockProject = {
  id: '10',
  name: 'Test Project',
  description: 'A test project',
  url: 'https://github.com/ansible/ansible-ui',
  import_state: 'completed',
  organization: { id: '1', name: 'Default' },
  summary_fields: { organization: { id: '1', name: 'Default' } },
};

const mockUsersResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 101,
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  ],
};

const mockRolesResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 201,
      name: 'EDA Project Admin',
      description: 'Has all permissions to a single project',
      content_type: 'eda.project',
      managed: true,
    },
  ],
};

const mockRoleAssignmentsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 301,
      role_definition: { id: 201, name: 'EDA Project Admin' },
      content_type: 'eda.project',
      object_id: '10',
    },
  ],
};

const server = setupServer(
  http.get(edaAPI`/projects/10/`, () => HttpResponse.json(mockProject)),
  http.get('*/api/gateway/v1/users/', () => HttpResponse.json(mockUsersResponse)),
  http.get('*/api/gateway/v1/role_definitions/', () => HttpResponse.json(mockRolesResponse)),
  http.get('*/api/gateway/v1/role_user_assignments/', () =>
    HttpResponse.json(mockRoleAssignmentsResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/projects/eda.project/10/users/user-abc-123/manage-roles']}>
      <Routes>
        <Route
          path="/projects/:resource_type/:resource_id/users/:user_id/manage-roles"
          element={<EdaProjectManageUsers />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaProjectManageUsers', () => {
  it('should render the page title with project and user names', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Manage roles directly assigned to testuser for Test Project/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('should render breadcrumbs including Projects, project name, and User Access', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByTestId('Projects')).toBeInTheDocument();
    expect(screen.getByTestId('User Access')).toBeInTheDocument();
  });

  it('should show loading state while project data is being fetched', () => {
    server.use(
      http.get(edaAPI`/projects/10/`, async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockProject);
      })
    );

    renderComponent();

    expect(
      screen.queryByRole('heading', { name: /Manage roles directly assigned to/i })
    ).not.toBeInTheDocument();
  });

  it('should show loading when user data is still loading', () => {
    server.use(
      http.get('*/api/gateway/v1/users/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockUsersResponse);
      })
    );

    renderComponent();

    expect(
      screen.queryByRole('heading', { name: /Manage roles directly assigned to/i })
    ).not.toBeInTheDocument();
  });

  it('should handle empty user results gracefully', async () => {
    server.use(
      http.get('*/api/gateway/v1/users/', () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /for Test Project/i })).toBeInTheDocument();
    });
  });
});
