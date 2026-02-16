import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxTeamRoles } from './AwxTeamRoles';

const emptyRoleTeamAssignments = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const roleDefinitionsOptions = {
  actions: {
    POST: {
      content_type: {
        choices: [
          { value: 'awx.organization', display_name: 'Organization' },
          { value: 'awx.team', display_name: 'Team' },
        ],
      },
    },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => {
      return HttpResponse.json(emptyRoleTeamAssignments);
    }
  ),
  http.options(
    ({ request }) => request.url.includes('role_definitions'),
    () => {
      return HttpResponse.json(roleDefinitionsOptions);
    }
  )
);

function renderAwxTeamRoles() {
  return render(
    <MemoryRouter initialEntries={['/teams/1/roles']}>
      <Routes>
        <Route path="/teams/:id/roles" element={<AwxTeamRoles />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxTeamRoles', () => {
  it('should render team roles view', async () => {
    renderAwxTeamRoles();

    await waitFor(() => {
      expect(screen.getByText('Add roles')).toBeInTheDocument();
    });
  });
});
