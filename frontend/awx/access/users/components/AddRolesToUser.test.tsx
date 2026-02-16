import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AddRolesToUser } from './AddRolesToUser';

const user = {
  id: 1,
  type: 'user',
  url: '/api/v2/users/1/',
  username: 'testuser',
  email: 'test@example.com',
  first_name: '',
  last_name: '',
  is_superuser: false,
  is_system_auditor: false,
  created: '',
  modified: '',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/users/') && request.url.includes('/1/'),
    () => HttpResponse.json(user)
  ),
  http.options(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AddRolesToUser', () => {
  it('should render wizard with Select a resource type step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/users/1/roles/add-roles']}>
        <Routes>
          <Route path="/users/:id/roles/add-roles" element={<AddRolesToUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Add roles');
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
