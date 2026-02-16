import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxAddTeamRoles } from './AwxAddTeamRoles';

const mockTeam = {
  id: 1,
  name: 'Test Team',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/teams/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockTeam)
  ),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxAddTeamRoles', () => {
  it('should render Add roles page title', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/roles/add']}>
        <Routes>
          <Route path="/teams/:id/roles/add" element={<AwxAddTeamRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(
          screen.getByTestId('wizard') ?? screen.getByLabelText('Wizard toggle')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
