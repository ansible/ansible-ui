/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubUserRoles } from './HubUserRoles';

const mockUserRoles = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 33,
      user: 1,
      role_definition: 5,
      object_id: 'published',
      content_type: 'galaxy.ansiblerepository',
      summary_fields: {
        role_definition: {
          id: 5,
          name: 'Galaxy Repository Admin',
          description: 'Admin for repository',
        },
        content_object: {
          id: 'published',
          name: 'published',
        },
      },
    },
    {
      id: 34,
      user: 1,
      role_definition: 6,
      object_id: 'staging',
      content_type: 'galaxy.ansiblerepository',
      summary_fields: {
        role_definition: {
          id: 6,
          name: 'Galaxy Repository Viewer',
          description: 'View repository',
        },
        content_object: {
          id: 'staging',
          name: 'staging',
        },
      },
    },
  ],
};

const mockRoleDefinitionsOptions = {
  actions: {
    POST: {
      content_type: {
        choices: [
          { value: 'galaxy.namespace', display_name: 'Namespace' },
          { value: 'galaxy.ansiblerepository', display_name: 'Repository' },
        ],
      },
    },
  },
};

describe('Hub user roles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the list of role assignments for the user', async () => {
    server.use(
      http.get('*/_ui/v2/role_user_assignments/*', () => {
        return HttpResponse.json(mockUserRoles);
      }),
      http.options('*/_ui/v2/role_definitions/', () => {
        return HttpResponse.json(mockRoleDefinitionsOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/1/roles']}>
        <Routes>
          <Route path="/access/users/:id/roles" element={<HubUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
    });

    expect(screen.getByText('staging')).toBeInTheDocument();
  });

  it('renders the correct columns and action buttons', async () => {
    server.use(
      http.get('*/_ui/v2/role_user_assignments/*', () => {
        return HttpResponse.json(mockUserRoles);
      }),
      http.options('*/_ui/v2/role_definitions/', () => {
        return HttpResponse.json(mockRoleDefinitionsOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/1/roles']}>
        <Routes>
          <Route path="/access/users/:id/roles" element={<HubUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add roles')).toBeInTheDocument();
    });

    expect(screen.getByText('Resource name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('displays empty state when no roles are assigned', async () => {
    server.use(
      http.get('*/_ui/v2/role_user_assignments/*', () => {
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      }),
      http.options('*/_ui/v2/role_definitions/', () => {
        return HttpResponse.json(mockRoleDefinitionsOptions);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/1/roles']}>
        <Routes>
          <Route path="/access/users/:id/roles" element={<HubUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/There are currently no Automation Content roles assigned to this user/)
      ).toBeInTheDocument();
    });
  });
});
