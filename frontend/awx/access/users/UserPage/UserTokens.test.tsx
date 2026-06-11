import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { UserTokens } from './UserTokens';

const mockActiveUser = {
  id: 1,
  username: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
};

const mockTokensResponse = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/me/'),
    () => HttpResponse.json({ results: [mockActiveUser] })
  ),
  http.get(
    ({ request }) => request.url.includes('/tokens/'),
    () => HttpResponse.json(mockTokensResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/tokens/'),
    () => HttpResponse.json({ actions: { POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserTokens', () => {
  it('should render tokens empty state when user has no tokens', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/tokens']}>
        <AwxActiveUserProvider>
          <Routes>
            <Route path="/users/:id/tokens" element={<UserTokens />} />
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/There are currently no tokens/)).toBeInTheDocument();
    });
  });

  it('should display Create token button', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/tokens']}>
        <AwxActiveUserProvider>
          <Routes>
            <Route path="/users/:id/tokens" element={<UserTokens />} />
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create token')).toBeInTheDocument();
    });
  });
});
