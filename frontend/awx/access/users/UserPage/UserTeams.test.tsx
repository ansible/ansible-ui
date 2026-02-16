import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserTeams } from './UserTeams';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/users/') &&
      request.url.includes('/1/') &&
      !request.url.includes('teams'),
    () => HttpResponse.json(mockUser)
  ),
  http.options(
    ({ request }) => request.url.includes('/users/') && !request.url.includes('/1/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('/teams/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/users/') && request.url.includes('/teams/'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserTeams', () => {
  it('should render empty state when user has no teams', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/teams']}>
        <Routes>
          <Route path="/users/:id/teams" element={<UserTeams />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('This user currently does not belong to any teams.')
      ).toBeInTheDocument();
    });
  });
});
