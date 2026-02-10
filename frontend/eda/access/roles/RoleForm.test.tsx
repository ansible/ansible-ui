/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CreateRole, EditRole } from './RoleForm';

vi.mock('../../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({
    activeEdaUser: {
      id: 1,
      username: 'admin',
      is_superuser: true,
    },
  }),
}));

const mockRole = {
  id: 1,
  name: 'Test Role',
  description: 'A test role',
  content_type: 'eda.project',
  permissions: ['eda.view_project'],
  managed: false,
  created_at: '2024-04-10T17:43:26.032037Z',
  modified_at: '2024-04-10T17:43:26.032048Z',
};

describe('RoleForm', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('CreateRole', () => {
    it('renders the create role form', async () => {
      render(
        <MemoryRouter>
          <CreateRole />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Create role/i })).toBeInTheDocument();
      });
    });

    it('displays required form fields', async () => {
      render(
        <MemoryRouter>
          <CreateRole />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      });
    });
  });

  describe('EditRole', () => {
    it('renders the edit form with preloaded data', async () => {
      server.use(
        http.get('*/role_definitions/1/', () => {
          return HttpResponse.json(mockRole);
        })
      );

      render(
        <MemoryRouter initialEntries={['/roles/1/edit']}>
          <Routes>
            <Route path="/roles/:id/edit" element={<EditRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
      });
    });
  });
});
