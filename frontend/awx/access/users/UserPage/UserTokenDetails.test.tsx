import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserTokenDetails } from './UserTokenDetails';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
};

const mockToken = {
  id: 10,
  description: 'My Test Token',
  scope: 'write',
  expires: '2025-12-31T23:59:59Z',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    user: { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User' },
    application: { id: 1, name: 'My Application' },
  },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/api/v2/users/') &&
      request.url.includes('/1/') &&
      !request.url.includes('tokens'),
    () => HttpResponse.json(mockUser)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/v2/tokens/') && request.url.includes('/10/'),
    () => HttpResponse.json(mockToken)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserTokenDetails', () => {
  it('should display token details when token is loaded', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/tokens/10/details']}>
        <Routes>
          <Route path="/users/:id/tokens/:tokenid/details" element={<UserTokenDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockToken.description)).toBeInTheDocument();
    });

    expect(screen.getByText(mockToken.description)).toBeInTheDocument();
    expect(screen.getByText(mockToken.summary_fields.application.name)).toBeInTheDocument();
  });
});
