/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentUserAccess } from './ExecutionEnvironmentUserAccess';

describe('ExecutionEnvironmentUserAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders user access list description', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/role_user_access/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/user-access']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access"
            element={<ExecutionEnvironmentUserAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/list of users with access to this resource/i)).toBeInTheDocument();
    });
  });

  it('shows error when execution environment fails to load', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/user-access']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access"
            element={<ExecutionEnvironmentUserAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });
});
