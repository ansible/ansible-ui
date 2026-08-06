/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserIndirectRolesPanel } from './UserIndirectRolesPanel';

const mockTeams = {
  count: 1,
  results: [{ id: 10, name: 'Ops Team' }],
};

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
          id: 5,
          name: 'Team Member',
          description: 'Member of team',
          managed: true,
        },
        team: { id: 10, name: 'Ops Team' },
        content_object: { name: 'Default Org', id: 1 },
      },
      object_id: '1',
      content_type: 'shared.organization',
      role_definition: 5,
      team: 10,
    },
  ],
};

const mockEmptyTeams = {
  count: 0,
  results: [],
};

const mockEmptyAssignments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('UserIndirectRolesPanel', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render the alert when indirect roles exist', async () => {
    server.use(
      http.get('*/users/42/teams/*', () => HttpResponse.json(mockTeams)),
      http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments))
    );

    render(
      <MemoryRouter>
        <UserIndirectRolesPanel userId="42" username="alice" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Indirectly assigned roles/)).toBeInTheDocument();
    });
  });

  it('should not render the alert when no indirect roles exist', async () => {
    server.use(
      http.get('*/users/42/teams/*', () => HttpResponse.json(mockEmptyTeams)),
      http.get('*/role_team_assignments/*', () => HttpResponse.json(mockEmptyAssignments))
    );

    render(
      <MemoryRouter>
        <UserIndirectRolesPanel userId="42" username="alice" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Indirectly assigned roles/)).not.toBeInTheDocument();
    });
  });
});
