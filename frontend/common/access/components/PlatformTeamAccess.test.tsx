/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformTeamAccess } from './PlatformTeamAccess';

const mockTeamAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      summary_fields: {
        object_role: { id: 1 },
        role_definition: {
          id: 15,
          name: 'Organization Admin',
          description: 'Full admin on organization',
          managed: true,
        },
        team: { id: 3, name: 'Platform Ops' },
        content_object: { name: 'Default', id: 1 },
      },
      object_id: '1',
      content_type: 'shared.organization',
      role_definition: 15,
      team: 3,
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('PlatformTeamAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render team assignments with role and team name', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments)));

    render(
      <MemoryRouter>
        <PlatformTeamAccess id="1" type="organization" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Platform Ops')).toBeInTheDocument();
    });
  });

  it('should display empty state when no teams assigned', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <PlatformTeamAccess id="1" type="organization" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No teams are assigned/)).toBeInTheDocument();
    });
  });

  it('should render the Team name column header', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments)));

    render(
      <MemoryRouter>
        <PlatformTeamAccess id="1" type="organization" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Team name').length).toBeGreaterThan(0);
    });
  });

  it('should render assign teams button', async () => {
    server.use(http.get('*/role_team_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <PlatformTeamAccess id="1" type="organization" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Assign teams')).toBeInTheDocument();
    });
  });
});
