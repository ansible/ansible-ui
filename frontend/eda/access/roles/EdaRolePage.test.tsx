/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaActiveUserContext } from '../../common/useEdaActiveUser';
import { EdaRolePage } from './EdaRolePage';

const mockRole = {
  id: 5,
  name: 'Editor Role',
  description: 'Can edit resources',
  managed: false,
  content_type: 'eda.project',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const mockManagedRole = {
  ...mockRole,
  id: 6,
  name: 'Admin',
  managed: true,
};

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

const server = setupServer(
  http.get('*/role_definitions/5/', () => HttpResponse.json(mockRole)),
  http.get('*/role_definitions/6/', () => HttpResponse.json(mockManagedRole)),
  http.get('*/users/me/', () => HttpResponse.json(mockActiveUser))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderRolePage(roleId: string = '5') {
  return render(
    <MemoryRouter initialEntries={[`/roles/${roleId}/details`]}>
      <EdaActiveUserContext.Provider
        value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
      >
        <Routes>
          <Route path="/roles/:id/*" element={<EdaRolePage />} />
        </Routes>
      </EdaActiveUserContext.Provider>
    </MemoryRouter>
  );
}

describe('EdaRolePage', () => {
  it('should render role page with role name in header', async () => {
    renderRolePage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Editor Role', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs with Roles link', async () => {
    renderRolePage();

    await waitFor(() => {
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });
  });

  it('should display Details tab', async () => {
    renderRolePage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('should display back to Roles tab', async () => {
    renderRolePage();

    await waitFor(() => {
      expect(screen.getByText('Back to Roles')).toBeInTheDocument();
    });
  });

  it('should use custom breadcrumb label', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/5/details']}>
        <EdaActiveUserContext.Provider
          value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
        >
          <Routes>
            <Route
              path="/roles/:id/*"
              element={<EdaRolePage breadcrumbLabelForPreviousPage="Custom Roles" />}
            />
          </Routes>
        </EdaActiveUserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Roles')).toBeInTheDocument();
    });
  });

  it('should use custom back tab label', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/5/details']}>
        <EdaActiveUserContext.Provider
          value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
        >
          <Routes>
            <Route path="/roles/:id/*" element={<EdaRolePage backTabLabel="Custom Back" />} />
          </Routes>
        </EdaActiveUserContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Back')).toBeInTheDocument();
    });
  });
});
