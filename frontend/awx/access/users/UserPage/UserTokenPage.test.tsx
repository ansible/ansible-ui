import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserTokenPage } from './UserTokenPage';

const mockToken = {
  id: 10,
  description: 'My Personal Access Token',
  scope: 'write',
  expires: '2025-12-31T23:59:59Z',
  summary_fields: {
    user: { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User' },
    application: { id: 1, name: 'Personal access token' },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/api/v2/tokens/') && request.url.includes('/10/'),
    () => HttpResponse.json(mockToken)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserTokenPage', () => {
  it('should display token description in breadcrumb', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/tokens/10']}>
        <Routes>
          <Route path="/users/:id/tokens/:tokenid" element={<UserTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockToken.summary_fields.application.name)).toBeInTheDocument();
    });
  });

  it('should display Token header', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/tokens/10']}>
        <Routes>
          <Route path="/users/:id/tokens/:tokenid" element={<UserTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Token')).toBeInTheDocument();
    });
  });
});
