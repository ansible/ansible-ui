import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxUserDetails } from './AwxUserDetails';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  related: {
    organizations: '/api/v2/users/1/organizations/',
  },
};

const mockOrganizations = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/api/v2/users/') &&
      request.url.includes('/1/') &&
      !request.url.includes('organizations'),
    () => HttpResponse.json(mockUser)
  ),
  http.get(
    ({ request }) => request.url.includes('organizations'),
    () => HttpResponse.json(mockOrganizations)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxUserDetails', () => {
  it('should display user details when user is loaded', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/details']}>
        <Routes>
          <Route path="/users/:id/details" element={<AwxUserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.first_name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.last_name)).toBeInTheDocument();
  });
});
