import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { UserPage } from './UserPage';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/users/') &&
      request.url.includes('/1/') &&
      !request.url.includes('organizations') &&
      !request.url.includes('teams'),
    () => HttpResponse.json(mockUser)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserPage', () => {
  it('should display username in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1']}>
        <AwxActiveUserProvider disabled>
          <Routes>
            <Route path="/users/:id" element={<UserPage />} />
          </Routes>
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('testuser');
    });
  });
});
