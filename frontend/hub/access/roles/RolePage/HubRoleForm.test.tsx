/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CreateRole, EditRole } from './HubRoleForm';

const mockCustomRole = {
  id: 21,
  url: '',
  related: {},
  summary_fields: {},
  permissions: ['galaxy.view_ansiblerepository'],
  content_type: 'galaxy.ansiblerepository',
  modified: '2024-08-06T17:22:26.294509Z',
  created: '2024-08-06T17:22:06.956461Z',
  name: 'galaxy.test_custom_role',
  description: 'View repository',
  managed: false,
  modified_by: 4,
  created_by: 4,
};

// Mock navigator
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('HubRoleForm', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Create Role', () => {
    it('renders submit button', () => {
      render(
        <MemoryRouter>
          <CreateRole />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /Create role/i })).toBeInTheDocument();
    });

    it('renders create role form with required fields', () => {
      render(
        <MemoryRouter>
          <CreateRole />
        </MemoryRouter>
      );

      // Check for page title (heading)
      expect(screen.getByRole('heading', { name: /Create role/i })).toBeInTheDocument();
      expect(screen.getByTestId('name')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });
  });

  describe('Edit Role', () => {
    it('loads and displays existing role data', async () => {
      server.use(
        http.get('*/_ui/v2/role_definitions/1/', () => {
          return HttpResponse.json(mockCustomRole);
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
        const nameInput = screen.getByTestId('name');
        expect(nameInput).toHaveValue('galaxy.test_custom_role');
      });

      const descriptionInput = screen.getByTestId('description');
      expect(descriptionInput).toHaveValue('View repository');
    });
  });
});
