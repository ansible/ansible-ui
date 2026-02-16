import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExecutionEnvironmentTeamAccess } from './ExecutionEnvironmentTeamAccess';

const mockExecutionEnvironment = {
  id: 1,
  managed: false,
  organization: 1,
  name: 'Test EE',
  type: 'execution_environment',
  url: '/api/v2/execution_environments/1/',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('execution_environments') && request.url.includes('/1'),
    () => HttpResponse.json(mockExecutionEnvironment)
  ),
  http.get(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentTeamAccess', () => {
  it(
    'should render team access with Team name or Assign teams when EE is not managed and has organization',
    {
      timeout: 10000,
    },
    async () => {
      render(
        <MemoryRouter initialEntries={['/execution-environments/1/team-access']}>
          <Routes>
            <Route
              path="/execution-environments/:id/team-access"
              element={<ExecutionEnvironmentTeamAccess />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          const el = screen.queryByText('Team name') ?? screen.queryByText('Assign teams');
          expect(el).toBeInTheDocument();
        },
        { timeout: 8000 }
      );
    }
  );
});
