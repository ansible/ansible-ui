/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubTeamRoles } from './TeamUserRole';

const server = setupServer(
  http.get('*/_ui/v2/role_team_assignments/*', () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options('*/_ui/v2/role_definitions/', () =>
    HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HubTeamRoles', () => {
  it('renders team roles access view', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/5/roles']}>
        <Routes>
          <Route path="/teams/:id/roles" element={<HubTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no roles assigned to this team.')
      ).toBeInTheDocument();
    });
  });
});
