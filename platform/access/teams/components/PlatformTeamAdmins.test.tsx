import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformTeamAdmins } from './PlatformTeamAdmins';

vi.mock('../../users/hooks/useUserColumns', () => ({
  useUsersColumns: () => [{ header: 'Username', cell: () => null }],
}));
vi.mock('../../users/hooks/useUsersFilters', () => ({
  useUsersFilters: () => [],
}));
vi.mock('../hooks/useTeamAdminsActions', () => ({
  useTeamAdminsToolbarActions: () => [{ label: 'toolbar-add-admin' }],
  useTeamAdminsRowActions: () => [{ label: 'row-remove-admin' }],
}));

const team = {
  id: 99,
  name: 'Admins',
  description: '',
  organization: 1,
  url: gatewayAPI`/teams/99/`,
  created: '',
  modified: '',
};

const adminsList = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('PlatformTeamAdmins', () => {
  const server = setupServer(
    http.get(gatewayAPI`/teams/99/`, () => HttpResponse.json(team)),
    http.options(gatewayAPI`/teams/99/`, () =>
      HttpResponse.json({
        actions: { PATCH: true },
      })
    ),
    http.get(`${gatewayAPI`/teams/99/admins/`}*`, () => HttpResponse.json(adminsList))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  function renderRoute() {
    return render(
      <MemoryRouter initialEntries={['/platform/teams/99/admins']}>
        <Routes>
          <Route path="/platform/teams/:id/admins" element={<PlatformTeamAdmins />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders empty editable state when PATCH is allowed', async () => {
    renderRoute();
    await waitFor(() => {
      expect(
        screen.getByText('There are currently no administrators added to this team.')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('Add administrators by clicking the button below.')
    ).toBeInTheDocument();
  });

  it('renders restricted empty state without edit permission', async () => {
    server.use(
      http.options(gatewayAPI`/teams/99/`, () => HttpResponse.json({ actions: { GET: true } }))
    );
    renderRoute();
    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to add an administrator to this team.')
      ).toBeInTheDocument();
    });
  });
});
