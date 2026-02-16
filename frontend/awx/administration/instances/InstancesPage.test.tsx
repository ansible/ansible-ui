import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstancePage } from './InstancesPage';

const instance = {
  id: 1,
  type: 'instance',
  url: '/api/v2/instances/1/',
  hostname: 'awx-node-1',
  uuid: 'abc-123',
  node_type: 'hybrid',
  node_state: 'ready',
  capacity: 100,
  consumed_capacity: 20,
  percent_capacity_remaining: 80,
  cpu: 4,
  memory: 8589934592,
  enabled: true,
  managed: false,
  errors: '',
  summary_fields: { user_capabilities: {} },
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('instances') && request.url.includes('/1'),
    () => HttpResponse.json(instance)
  ),
  http.get(
    ({ request }) => request.url.includes('settings/system'),
    () => HttpResponse.json({ IS_K8S: false })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstancePage', () => {
  it('should render instance page with hostname', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1']}>
        <Routes>
          <Route path="/instances/:id" element={<InstancePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('awx-node-1');
    });
  });
});
