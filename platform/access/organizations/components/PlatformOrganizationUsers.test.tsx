import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PlatformOrganizationUsers } from './PlatformOrganizationUsers';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './organization.fixture.json';
import mockUsers from './users.fixture.json';
import mockEmptyUsers from './emptyUsers.fixture.json';
import mockOrganizationOptions from './organizationOptions.fixture.json';

describe('PlatformOrganizationUsers', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/users/`, () => {
      return HttpResponse.json(mockUsers);
    }),
    http.get(gatewayAPI`/organizations/1/`, () => {
      return HttpResponse.json(mockOrganization);
    }),
    http.options(gatewayAPI`/organizations/1/`, () => {
      return HttpResponse.json(mockOrganizationOptions);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render user list with data', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-user1')).toBeInTheDocument();
      expect(screen.getByText('test-user2')).toBeInTheDocument();
    });
  });

  test('should show empty state when no users are assigned', async () => {
    server.use(
      http.get(gatewayAPI`/organizations/1/users/`, () => {
        return HttpResponse.json(mockEmptyUsers);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No users')).toBeInTheDocument();
      expect(
        screen.getByText(/To get started, assign users to this organization/)
      ).toBeInTheDocument();
    });
  });

  test('should display error message on load failure', async () => {
    server.use(
      http.get(gatewayAPI`/organizations/1/users/`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
  });

  test('should show assign users button when user has permissions', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const assignButton = screen.getByText('Assign users');
      expect(assignButton).toBeInTheDocument();
      expect(assignButton.closest('button')).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  test('should disable assign users button when user lacks permissions', async () => {
    server.use(
      http.options(gatewayAPI`/organizations/1/`, () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const assignButton = screen.getByText('Assign users');
      expect(assignButton).toBeInTheDocument();
      expect(assignButton.closest('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test('should show permission denied empty state when user lacks permissions', async () => {
    server.use(
      http.get(gatewayAPI`/organizations/1/users/`, () => {
        return HttpResponse.json(mockEmptyUsers);
      }),
      http.options(gatewayAPI`/organizations/1/`, () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/users']}>
        <Routes>
          <Route path="/access/organizations/:id/users" element={<PlatformOrganizationUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to add a user to this organization.')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please contact your organization administrator/)
      ).toBeInTheDocument();
    });
  });
});
