/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { EdaActiveUserContext } from '../../../common/useEdaActiveUser';
import { UserPage } from './UserPage';

const mockUser = {
  id: 42,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
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
  http.get(edaAPI`/users/42/`, () => HttpResponse.json(mockUser)),
  http.get(edaAPI`/users/me/`, () => HttpResponse.json(mockActiveUser))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderUserPage() {
  return render(
    <MemoryRouter initialEntries={['/users/42/details']}>
      <EdaActiveUserContext.Provider
        value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
      >
        <Routes>
          <Route path="/users/:id/*" element={<UserPage />} />
        </Routes>
      </EdaActiveUserContext.Provider>
    </MemoryRouter>
  );
}

describe('UserPage', () => {
  it('should render user page with username in header', async () => {
    renderUserPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'testuser', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs with Users link', async () => {
    renderUserPage();

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('should display tabs for Details and Roles', async () => {
    renderUserPage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('should render loading page when active user is not available', () => {
    render(
      <MemoryRouter initialEntries={['/users/42/details']}>
        <EdaActiveUserContext.Provider
          value={{ activeEdaUser: undefined, refreshActiveEdaUser: () => {} }}
        >
          <Routes>
            <Route path="/users/:id/*" element={<UserPage />} />
          </Routes>
        </EdaActiveUserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });

  it('should display back to Users tab', async () => {
    renderUserPage();

    await waitFor(() => {
      expect(screen.getByText('Back to Users')).toBeInTheDocument();
    });
  });
});
