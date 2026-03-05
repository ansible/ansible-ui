import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { OrganizationExecutionEnvironments } from './OrganizationExecutionEnvironments';

const server = setupServer(
  http.options(
    ({ request }) =>
      request.url.includes('execution_environments') && request.url.includes('organizations'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) =>
      request.url.includes('execution_environments') && request.url.includes('organizations'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrganizationExecutionEnvironments', () => {
  it('should render execution environments list', async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/execution-environments']}>
        <Routes>
          <Route
            path="/organizations/:id/execution-environments"
            element={<OrganizationExecutionEnvironments />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No execution environments yet')).toBeInTheDocument();
    });
  });
});
