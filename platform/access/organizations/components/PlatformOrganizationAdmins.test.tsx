import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import mockUsers from './fixtures/users.fixture.json';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformOrganizationAdmins } from './PlatformOrganizationAdmins';

vi.mock('../../users/hooks/useUserColumns', () => ({
  useUsersColumns: () => [
    {
      header: 'Username',
      cell: (user: PlatformUser) => user.username,
    },
  ],
}));
vi.mock('../../users/hooks/useUsersFilters', () => ({
  useUsersFilters: () => [],
}));
vi.mock('../hooks/useOrganizationAdminsActions', () => ({
  useOrganizationAdminsToolbarActions: () => [{ label: 'toolbar-add-admin' }],
  useOrganizationAdminsRowActions: () => [{ label: 'row-remove-admin' }],
}));

describe('PlatformOrganizationAdmins', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
    http.options(gatewayAPI`/organizations/1/`, () =>
      HttpResponse.json({
        actions: { PATCH: true },
      })
    ),
    http.get(`${gatewayAPI`/organizations/1/admins/`}*`, () => HttpResponse.json(mockUsers))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  function renderRoute() {
    return render(
      <MemoryRouter initialEntries={['/access/organizations/1/admins']}>
        <Routes>
          <Route path="/access/organizations/:id/admins" element={<PlatformOrganizationAdmins />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders administrators from the organization admins endpoint', async () => {
    renderRoute();

    await waitFor(() => {
      expect(screen.getByText('test-user1')).toBeInTheDocument();
      expect(screen.getByText('test-user2')).toBeInTheDocument();
    });
  });

  it('renders restricted empty state without edit permission', async () => {
    server.use(
      http.get(`${gatewayAPI`/organizations/1/admins/`}*`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      ),
      http.options(gatewayAPI`/organizations/1/`, () =>
        HttpResponse.json({ actions: { GET: true } })
      )
    );

    renderRoute();

    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to add an administrator to this organization.')
      ).toBeInTheDocument();
    });
  });
});
