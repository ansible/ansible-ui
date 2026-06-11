import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserOrganizations } from './UserOrganizations';

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
      !request.url.includes('organizations'),
    () => HttpResponse.json(mockUser)
  ),
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/users/') && request.url.includes('/organizations/'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserOrganizations', () => {
  it('should render empty state when user has no organizations', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/organizations']}>
        <Routes>
          <Route path="/users/:id/organizations" element={<UserOrganizations />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User is not a member of any organizations.')).toBeInTheDocument();
    });
  });
});
