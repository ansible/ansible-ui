import { act, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateUser } from './UserForm';

const mockOrganizations = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Default', type: 'organization' }],
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && !request.url.includes('/1/users/'),
    () => HttpResponse.json(mockOrganizations)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  act(() => {
    vi.runAllTimers();
  });
  vi.useRealTimers();
  server.resetHandlers();
});
afterAll(() => server.close());

describe('UserForm', () => {
  describe('CreateUser', () => {
    it('should render create user page with title', async () => {
      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create user');
      });
    });

    it('should render Username form field', async () => {
      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('username-form-group')).toBeInTheDocument();
      });
    });
  });
});
