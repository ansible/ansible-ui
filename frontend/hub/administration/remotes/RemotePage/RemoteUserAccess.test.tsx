/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RemoteUserAccess } from './RemoteUserAccess';

const mockRemote = {
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/abc123/',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
};

const server = setupServer(
  http.get('*/pulp/api/v3/remotes/ansible/collection/*', () =>
    HttpResponse.json({ count: 1, results: [mockRemote] })
  ),
  http.get('*/role_user_access/*', () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get('*/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RemoteUserAccess', () => {
  it('renders user access view for a remote', async () => {
    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/user-access']}>
        <Routes>
          <Route path="/remotes/:id/user-access" element={<RemoteUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No users assigned/)).toBeInTheDocument();
    });
  });
});
