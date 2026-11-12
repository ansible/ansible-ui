import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformAAPTeamUsers } from './PlatformAAPTeamUsers';

const { mockToolbar, mockRow } = vi.hoisted(() => ({
  mockToolbar: vi.fn(() => [{ label: 'toolbar-assign' }]),
  mockRow: vi.fn(() => [{ label: 'row-remove' }]),
}));

vi.mock('../../users/hooks/useUserColumns', () => ({
  useUsersColumns: () => [{ header: 'Username', cell: () => null }],
}));
vi.mock('../../users/hooks/useUsersFilters', () => ({
  useUsersFilters: () => [],
}));
vi.mock('../hooks/useTeamUsersActions', () => ({
  useTeamUsersToolbarActions: () => mockToolbar(),
  useTeamUsersRowActions: () => mockRow(),
}));

const team = {
  id: 42,
  name: 'Alpha',
  description: '',
  organization: 1,
  url: gatewayAPI`/teams/42/`,
  created: '',
  modified: '',
};

const usersList = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('PlatformAAPTeamUsers', () => {
  const server = setupServer(
    http.get(gatewayAPI`/teams/42/`, () => HttpResponse.json(team)),
    http.options(gatewayAPI`/teams/42/`, () =>
      HttpResponse.json({
        actions: { PUT: true },
      })
    ),
    http.get(`${gatewayAPI`/teams/42/users/`}*`, () => HttpResponse.json(usersList))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  function renderRoute() {
    return render(
      <MemoryRouter initialEntries={['/platform/teams/42/users']}>
        <Routes>
          <Route path="/platform/teams/:id/users" element={<PlatformAAPTeamUsers />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('shows loading while team or options load', () => {
    let release!: () => void;
    const teamGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(gatewayAPI`/teams/42/`, async () => {
        await teamGate;
        return HttpResponse.json(team);
      })
    );
    renderRoute();
    expect(document.querySelector('.pf-v6-c-spinner')).toBeTruthy();
    release();
  });

  it('renders empty assignable state when team is editable', async () => {
    renderRoute();
    await waitFor(() => {
      expect(screen.getByText('No users assigned to this team.')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'To get started, assign users to this team. These users will inherit roles assigned to this team.'
      )
    ).toBeInTheDocument();
  });

  it('renders restricted empty state when team cannot be edited', async () => {
    server.use(
      http.options(gatewayAPI`/teams/42/`, () => HttpResponse.json({ actions: { GET: true } }))
    );
    renderRoute();
    await waitFor(() => {
      expect(
        screen.getByText('You do not have permission to assign a user to this team.')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'Please contact your organization administrator if there is an issue with your access.'
      )
    ).toBeInTheDocument();
  });

  it('shows AwxError when team fetch fails', async () => {
    server.use(http.get(gatewayAPI`/teams/42/`, () => HttpResponse.json({}, { status: 500 })));
    renderRoute();
    expect(await screen.findByRole('heading', { level: 4 })).toBeInTheDocument();
  });
});
