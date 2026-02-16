import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExecutionEnvironmentUserAccess } from './ExecutionEnvironmentUserAccess';

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

describe('ExecutionEnvironmentUserAccess', () => {
  it('should render user access view with alert', async () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/1/user-access']}>
        <Routes>
          <Route
            path="/execution-environments/:id/user-access"
            element={<ExecutionEnvironmentUserAccess />}
          />
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
