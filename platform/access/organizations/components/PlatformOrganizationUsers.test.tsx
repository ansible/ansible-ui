import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockEmptyUsers from './fixtures/emptyUsers.fixture.json';
import mockOrganization from './fixtures/organization.fixture.json';
import mockOrganizationOptions from './fixtures/organizationOptions.fixture.json';
import mockUsers from './fixtures/organizationUsers.fixture.json';
import { PlatformOrganizationUsers } from './PlatformOrganizationUsers';

describe('PlatformOrganizationUsers', () => {
  const server = setupServer(
    http.get(gatewayAPI`/role_user_access/shared.organization/1/*`, () => {
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
      expect(screen.getByText('Assign users')).toBeInTheDocument();
      expect(screen.getByText('test-user1')).toBeInTheDocument();
      expect(screen.getByText('test-user2')).toBeInTheDocument();
      expect(screen.getByText('Organization roles')).toBeInTheDocument();
    });
  });

  test('should show empty state when no users are assigned', async () => {
    server.use(
      http.get(gatewayAPI`/role_user_access/shared.organization/1/*`, () => {
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
      http.get(gatewayAPI`/role_user_access/shared.organization/1/*`, () => {
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
      http.get(gatewayAPI`/role_user_access/shared.organization/1/*`, () => {
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
