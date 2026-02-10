/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TeamAccess } from './TeamAccess';

const mockTeamAssignments = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      summary_fields: {
        object_role: {
          id: 1,
        },
        role_definition: {
          id: 13,
          name: 'Activation Admin',
          description:
            'Has all permissions to a single activation and its child resources - rulebook process, audit rule',
          managed: true,
        },
        team: {
          id: 4,
          name: 'Team Assignment 1',
        },
      },
      object_role: 1,
      role_definition: 13,
      team: 4,
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('TeamAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the correct team access columns', async () => {
    server.use(
      http.get('*/role_team_assignments/*', () => {
        return HttpResponse.json(mockTeamAssignments);
      })
    );

    render(
      <MemoryRouter>
        <TeamAccess service="eda" id="1" type="activation" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Team Assignment 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Activation Admin')).toBeInTheDocument();
    // Check for column headers - Team name appears in multiple places, so check for at least one
    expect(screen.getAllByText('Team name').length).toBeGreaterThan(0);
    expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
  });

  it('displays empty state when no teams are assigned', async () => {
    server.use(
      http.get('*/role_team_assignments/*', () => {
        return HttpResponse.json(mockEmptyResults);
      })
    );

    render(
      <MemoryRouter>
        <TeamAccess service="eda" id="1" type="activation" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No teams assigned to rulebook activation/)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/To get started, assign teams to this rulebook activation./)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Assign teams/ })).toBeInTheDocument();
  });

  it('makes API request for AWX service', async () => {
    let requestMade = false;
    server.use(
      http.get('*/role_team_assignments/*', () => {
        requestMade = true;
        return HttpResponse.json(mockEmptyResults);
      })
    );

    render(
      <MemoryRouter>
        <TeamAccess service="awx" id="1" type="credentials" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(requestMade).toBe(true);
    });

    // Verify empty state is shown after request
    await waitFor(() => {
      expect(screen.getByText(/No teams assigned to credential/)).toBeInTheDocument();
    });
  });

  it('makes API request for EDA service', async () => {
    let requestMade = false;
    server.use(
      http.get('*/role_team_assignments/*', () => {
        requestMade = true;
        return HttpResponse.json(mockEmptyResults);
      })
    );

    render(
      <MemoryRouter>
        <TeamAccess service="eda" id="1" type="activation" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(requestMade).toBe(true);
    });

    // Verify empty state is shown after request
    await waitFor(() => {
      expect(screen.getByText(/No teams assigned to rulebook activation/)).toBeInTheDocument();
    });
  });

  it('makes API request for Hub service', async () => {
    let requestMade = false;
    server.use(
      http.get('*/role_team_assignments/*', () => {
        requestMade = true;
        return HttpResponse.json(mockEmptyResults);
      })
    );

    render(
      <MemoryRouter>
        <TeamAccess service="hub" id="1" type="namespace" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(requestMade).toBe(true);
    });

    // Verify empty state is shown after request
    await waitFor(() => {
      expect(screen.getByText(/No teams assigned to namespace/)).toBeInTheDocument();
    });
  });
});
