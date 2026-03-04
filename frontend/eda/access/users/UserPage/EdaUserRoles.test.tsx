/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaUserRoles } from './EdaUserRoles';

vi.mock('../../../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({
    activeEdaUser: {
      id: 1,
      username: 'admin',
      is_superuser: true,
    },
  }),
}));

const mockUserRoles = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      summary_fields: {
        role_definition: { id: 1, name: 'Project Admin' },
        content_object: { id: 1, name: 'Project VN' },
      },
      role_definition: 1,
      content_type: 'eda.project',
      object_id: 1,
      user: 1,
    },
    {
      id: 2,
      summary_fields: {
        role_definition: { id: 2, name: 'Activation Admin' },
        content_object: { id: 1, name: 'Activation 1' },
      },
      role_definition: 2,
      content_type: 'eda.activation',
      object_id: 1,
      user: 1,
    },
  ],
};

describe('EdaUserRoles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the user roles list', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockUserRoles);
      }),
      http.options('*/role_definitions*', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<EdaUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add roles')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/role_definitions*', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<EdaUserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no Automation Decisions roles assigned/i)).toBeInTheDocument();
    });
  });
});
