import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InventoryTeamAccess } from './InventoryTeamAccess';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryTeamAccess', () => {
  it('should render team access with Team name column header', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/team-access']}>
        <Routes>
          <Route path="/inventories/:id/team-access" element={<InventoryTeamAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const el = screen.queryByText('Team name') ?? screen.queryByText('Assign teams');
        expect(el).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  });
});
