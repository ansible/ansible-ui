import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceDetails } from './InstanceDetails';

const instance = {
  id: 1,
  type: 'instance',
  url: '/api/v2/instances/1/',
  hostname: 'awx-node-1',
  uuid: 'abc-123',
  node_type: 'hybrid',
  node_state: 'ready',
  health_check_pending: false,
  capacity: 100,
  consumed_capacity: 20,
  percent_capacity_remaining: 80,
  cpu: 4,
  memory: 8589934592,
  cpu_capacity: 32,
  mem_capacity: 68,
  capacity_adjustment: '1.0',
  enabled: true,
  managed: false,
  errors: '',
  ip_address: '',
  listener_port: null,
  peers_from_control_nodes: false,
  jobs_running: 0,
  jobs_total: 5,
  summary_fields: { user_capabilities: {} },
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('instance_groups'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('settings/system'),
    () => HttpResponse.json({ IS_K8S: false })
  ),
  http.get(
    ({ request }) => request.url.includes('/instances/') && request.url.includes('/1'),
    () => HttpResponse.json(instance)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceDetails', () => {
  it('should render instance hostname', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1/details']}>
        <Routes>
          <Route path="/instances/:id/details" element={<InstanceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('awx-node-1')).toBeInTheDocument();
    });
  });
});
