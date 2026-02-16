import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExecutionEnvironmentAssignTeams } from './ExecutionEnvironmentAssignTeams';

const executionEnvironment = {
  id: 1,
  type: 'execution_environment',
  name: 'Test EE',
  image: 'quay.io/ansible/awx:latest',
  url: '/api/v2/execution_environments/1/',
  managed: false,
  summary_fields: {},
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('execution_environments') && request.url.includes('/1/'),
    () => HttpResponse.json(executionEnvironment)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentAssignTeams', () => {
  it('should render wizard after loading execution environment', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/1/team-access/assign']}>
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
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
