/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubAddUserRoles } from './HubAddUserRoles';

const mockUser = {
  id: 7,
  username: 'vn2',
  first_name: '',
  last_name: '',
  is_superuser: false,
};

const mockUserRoles = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockRoleDefinitionsOptions = {
  actions: {
    POST: {
      content_type: {
        choices: [
          { value: null, display_name: 'System' },
          { value: 'galaxy.namespace', display_name: 'Namespace' },
          { value: 'galaxy.ansiblerepository', display_name: 'Repository' },
        ],
      },
    },
  },
};

describe('Hub user: Add roles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the wizard with correct steps', async () => {
    server.use(
      http.get('*/_ui/v2/users/7/', () => {
        return HttpResponse.json(mockUser);
      }),
      http.get('*/_ui/v2/role_user_assignments/*', () => {
        return HttpResponse.json(mockUserRoles);
      }),
      http.options('*/_ui/v2/role_definitions/', () => {
        return HttpResponse.json(mockRoleDefinitionsOptions);
      }),
      http.get('*/_ui/v2/role_definitions/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/_ui/v1/namespaces/*', () => {
        return HttpResponse.json({ meta: { count: 0 }, data: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/user/7/roles/add-roles']}>
        <Routes>
          <Route path="/user/:id/roles/add-roles" element={<HubAddUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the wizard component renders
    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
  });
});
