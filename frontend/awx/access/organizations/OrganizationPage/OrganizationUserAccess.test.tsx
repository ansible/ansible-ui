import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationUserAccess } from './OrganizationUserAccess';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_user_assignments'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationUserAccess', () => {
  it('should render user access with Username or Assign users', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/user-access']}>
        <Routes>
          <Route path="/organizations/:id/user-access" element={<OrganizationUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const el = screen.queryByText('Username') ?? screen.queryByText('Assign users');
        expect(el).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  });
});
