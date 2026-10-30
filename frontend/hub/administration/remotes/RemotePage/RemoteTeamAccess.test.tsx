/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RemoteTeamAccess } from './RemoteTeamAccess';

const mockRemote = {
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/12345678-1234-1234-1234-123456789abc/',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
};

const server = setupServer(
  http.get(pulpAPI`/remotes/ansible/collection/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('name') === 'test-remote') {
      return HttpResponse.json({ count: 1, results: [mockRemote] });
    }
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_team_assignments/*', () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RemoteTeamAccess', () => {
  it('renders team access empty state for remote', async () => {
    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/team-access']}>
        <Routes>
          <Route path="/remotes/:id/team-access" element={<RemoteTeamAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No teams are assigned/)).toBeInTheDocument();
    });
  });
});
