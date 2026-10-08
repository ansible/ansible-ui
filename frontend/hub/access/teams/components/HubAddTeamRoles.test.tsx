/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubAddTeamRoles } from './HubAddTeamRoles';

const mockTeam = {
  id: 3,
  name: 'Engineering',
};

const mockRoleDefinitionsOptions = {
  actions: {
    POST: {
      content_type: {
        choices: [
          { value: null, display_name: 'System' },
          { value: 'galaxy.namespace', display_name: 'Namespace' },
        ],
      },
    },
  },
};

describe('HubAddTeamRoles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the add roles wizard for a team', async () => {
    server.use(
      http.get('*/_ui/v2/teams/3/', () => HttpResponse.json(mockTeam)),
      http.options('*/_ui/v2/role_definitions/', () =>
        HttpResponse.json(mockRoleDefinitionsOptions)
      ),
      http.get('*/_ui/v2/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/_ui/v1/namespaces/*', () => HttpResponse.json({ meta: { count: 0 }, data: [] }))
    );

    render(
      <MemoryRouter initialEntries={['/teams/3/roles/add']}>
        <Routes>
          <Route path="/teams/:id/roles/add" element={<HubAddTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
  });
});
