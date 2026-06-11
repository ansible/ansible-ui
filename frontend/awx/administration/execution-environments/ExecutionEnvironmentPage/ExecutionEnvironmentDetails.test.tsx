import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExecutionEnvironmentDetails } from './ExecutionEnvironmentDetails';

const executionEnvironment = {
  id: 1,
  type: 'execution_environment',
  url: '/api/v2/execution_environments/1/',
  name: 'Test EE',
  image: 'quay.io/ansible/awx:latest',
  managed: false,
  summary_fields: { user_capabilities: {} },
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('execution_environments') &&
      (request.url.includes('/1/') || request.url.endsWith('/1')),
    () => HttpResponse.json(executionEnvironment)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentDetails', () => {
  it('should render execution environment name and details', async () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/1/details']}>
        <Routes>
          <Route
            path="/execution-environments/:id/details"
            element={<ExecutionEnvironmentDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('Test EE');
    });
  });
});
