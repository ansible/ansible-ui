import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxProjectAssignTeams } from './AwxProjectAssignTeams';

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: '',
  scm_type: 'git',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/projects/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockProject)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxProjectAssignTeams', () => {
  it('should render wizard with Select team(s) step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/team-access/assign-teams']}>
        <Routes>
          <Route
            path="/projects/:id/team-access/assign-teams"
            element={<AwxProjectAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
