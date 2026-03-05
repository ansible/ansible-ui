import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Teams } from './Teams';

const mockTeams = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'team',
      name: 'Team 1',
      description: 'Test team 1',
      organization: 1,
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        user_capabilities: { edit: true, delete: true },
      },
    },
    {
      id: 2,
      type: 'team',
      name: 'Team 2',
      description: 'Test team 2',
      organization: 1,
      summary_fields: {
        organization: { id: 1, name: 'Default' },
        user_capabilities: { edit: false, delete: false },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/teams/`, () => {
    return HttpResponse.json({
      actions: { POST: { name: {} }, GET: {} },
    });
  }),
  http.get(awxAPI`/teams/`, () => {
    return HttpResponse.json(mockTeams);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Teams', () => {
  it('should render teams list page', async () => {
    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
  });

  it('should display teams in table', async () => {
    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Team 2')).toBeInTheDocument();
    });

    const team1Cell = screen.getByText('Team 1').closest('td');
    expect(team1Cell).toBeInTheDocument();
    const table = team1Cell?.closest('table');
    expect(table).toBeInTheDocument();
    const rows = table?.querySelectorAll('tbody tr') ?? [];
    expect(rows).toHaveLength(2);
  });

  it('should display error state when teams fail to load', async () => {
    server.use(http.get(awxAPI`/teams/`, () => HttpResponse.json({}, { status: 500 })));

    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading teams/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no teams exist and user can create', async () => {
    server.use(
      http.get(awxAPI`/teams/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No teams found')).toBeInTheDocument();
    });
    expect(
      screen.getByText('There are currently no teams assigned to your organization.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create team/i })).toBeInTheDocument();
  });

  it('should display empty state without create button when user lacks permission', async () => {
    server.use(
      http.options(awxAPI`/teams/`, () => HttpResponse.json({ actions: { GET: {} } })),
      http.get(awxAPI`/teams/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No teams found')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'Please contact your organization administrator if there is an issue with your access.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create team/i })).not.toBeInTheDocument();
  });
});
