/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { hubAPI } from '../../../common/api/formatPath';
import { RemoteRegistryDetails } from './RemoteRegistryDetails';

const mockRegistry = {
  id: '123',
  pulp_href: '/api/galaxy/pulp/api/v3/registries/123/',
  name: 'test-registry',
  url: 'https://registry.example.com',
  policy: 'immediate' as const,
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-01-01T00:00:00.000000Z',
  tls_validation: true,
  client_cert: null,
  ca_cert: null,
  last_sync_task: {
    task_id: 'task-1',
    state: 'completed' as const,
    started_at: '2024-01-01T00:00:00.000000Z',
    finished_at: '2024-01-01T00:01:00.000000Z',
    error: null,
  },
  download_concurrency: 10,
  proxy_url: null,
  write_only_fields: [],
  rate_limit: null,
  is_indexable: true,
};

const server = setupServer(
  http.get(hubAPI`/_ui/v1/execution-environments/registries/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('name') === 'test-registry') {
      return HttpResponse.json({ meta: { count: 1 }, data: [mockRegistry] });
    }
    return HttpResponse.json({ meta: { count: 0 }, data: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RemoteRegistryDetails', () => {
  it('renders registry details', async () => {
    render(
      <MemoryRouter initialEntries={['/execution-environments/registries/test-registry/details']}>
        <Routes>
          <Route
            path="/execution-environments/registries/:id/details"
            element={<RemoteRegistryDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-registry')).toBeInTheDocument();
    });
    expect(screen.getByText('https://registry.example.com')).toBeInTheDocument();
  });
});
