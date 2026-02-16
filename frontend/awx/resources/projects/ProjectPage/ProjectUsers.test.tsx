import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProjectUsers } from './ProjectUsers';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('role_user_access'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProjectUsers', () => {
  it('should render user access view with alert', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/user-access']}>
        <Routes>
          <Route path="/projects/:id/user-access" element={<ProjectUsers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Below displays a list of users with access/)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
