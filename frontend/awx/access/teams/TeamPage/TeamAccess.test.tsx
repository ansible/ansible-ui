import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TeamAccess } from './TeamAccess';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_user_assignments'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TeamAccess', () => {
  it('should render user access view with empty state', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/1/access']}>
        <Routes>
          <Route path="/teams/:id/access" element={<TeamAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No users assigned to team/)).toBeInTheDocument();
    });
    expect(screen.getByText('Assign users')).toBeInTheDocument();
  });
});
