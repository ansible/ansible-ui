import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserRoles } from './UserRoles';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_user_assignments'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ actions: { POST: { content_type: { choices: [] } } } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserRoles', () => {
  it('should render user roles empty state', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<UserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/There are currently no Automation Execution roles assigned to this user/)
      ).toBeInTheDocument();
    });
  });

  it('should display Add roles button', async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/roles']}>
        <Routes>
          <Route path="/users/:id/roles" element={<UserRoles />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add roles')).toBeInTheDocument();
    });
  });
});
