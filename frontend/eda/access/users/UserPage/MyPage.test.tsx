/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaActiveUserContext } from '../../../common/useEdaActiveUser';
import { MyPage } from './MyPage';

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  first_name: 'Admin',
  last_name: 'User',
  is_superuser: true,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

const mockNonSuperUser = {
  id: 2,
  username: 'regularuser',
  email: 'regular@example.com',
  first_name: 'Regular',
  last_name: 'User',
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'def-456', resource_type: 'shared.user' },
};

const server = setupServer(http.get('*/users/me/', () => HttpResponse.json(mockUser)));

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderMyPage(activeUser = mockUser) {
  return render(
    <MemoryRouter initialEntries={['/eda/access/users/me/details']}>
      <EdaActiveUserContext.Provider
        value={{ activeEdaUser: activeUser, refreshActiveEdaUser: () => {} }}
      >
        <Routes>
          <Route path="/eda/access/users/me/*" element={<MyPage />} />
        </Routes>
      </EdaActiveUserContext.Provider>
    </MemoryRouter>
  );
}

describe('MyPage', () => {
  it('should render user page with username in header', async () => {
    renderMyPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'admin', level: 1 })).toBeInTheDocument();
    });
  });

  it('should display breadcrumbs for superuser', async () => {
    renderMyPage();

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('should display Details tab', async () => {
    renderMyPage();

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('should show loading state when no active user', () => {
    render(
      <MemoryRouter initialEntries={['/eda/access/users/me/details']}>
        <EdaActiveUserContext.Provider
          value={{ activeEdaUser: undefined, refreshActiveEdaUser: () => {} }}
        >
          <Routes>
            <Route path="/eda/access/users/me/*" element={<MyPage />} />
          </Routes>
        </EdaActiveUserContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
  });

  it('should not display breadcrumbs for non-superuser', async () => {
    server.use(http.get('*/users/me/', () => HttpResponse.json(mockNonSuperUser)));

    renderMyPage(mockNonSuperUser);

    await waitFor(() => {
      expect(screen.getByText('regularuser')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
  });
});
