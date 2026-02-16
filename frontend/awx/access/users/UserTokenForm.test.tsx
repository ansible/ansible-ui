import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../common/useAwxActiveUser';
import { AwxCreateUserToken } from './UserTokenForm';

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  is_system_auditor: false,
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/me/'),
    () => {
      return HttpResponse.json({
        count: 1,
        results: [mockActiveUser],
      });
    }
  ),
  http.options(
    ({ request }) => request.url.includes('/applications/'),
    () => {
      return HttpResponse.json({ actions: { GET: {} } });
    }
  )
);

function renderUserTokenForm() {
  return render(
    <MemoryRouter initialEntries={['/users/1/tokens/create']}>
      <Routes>
        <Route
          path="/users/:id/tokens/create"
          element={
            <AwxActiveUserProvider>
              <AwxCreateUserToken onSuccessfulCreate={() => {}} />
            </AwxActiveUserProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserTokenForm', () => {
  it('should display Create Token page title when active user matches route', async () => {
    renderUserTokenForm();

    await waitFor(() => {
      expect(screen.getByText('Create Token')).toBeInTheDocument();
    });
  });
});
