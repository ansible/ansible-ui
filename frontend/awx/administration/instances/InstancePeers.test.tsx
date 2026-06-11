import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { InstancePeers } from './InstancePeers';

const mockInstance = {
  id: 1,
  hostname: 'test-instance',
  enabled: true,
  instance_type: 'execution',
  instance_state: 'installed',
  description: '',
  type: 'instance',
  url: '/api/v2/instances/1/',
  related: {
    jobs: '/api/v2/instances/1/jobs/',
    instance_groups: '/api/v2/instances/1/instance_groups/',
    peers: '/api/v2/instances/1/peers/',
    receptor_addresses: '/api/v2/instances/1/receptor_addresses/',
  },
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
  },
  uuid: 'uuid-1',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  last_seen: '2024-01-01T00:00:00Z',
  health_check_started: null,
  health_check_pending: false,
  errors: '',
  capacity_adjustment: '1',
  version: '1.0',
  capacity: 100,
  consumed_capacity: 0,
  percent_capacity_remaining: 100,
  jobs_running: 0,
  jobs_total: 0,
  cpu: '1',
  memory: 1024,
  cpu_capacity: 100,
  mem_capacity: 1024,
  peers_from_control_nodes: false,
  node_type: 'execution',
  node_state: 'installed',
  ip_address: null,
  listener_port: 27199,
  protocol: 'tcp',
  managed: true,
};

const mockPeersResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/instances/1/peers'),
    () => HttpResponse.json(mockPeersResponse)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/instances/') &&
      /\/instances\/1\/?$/.test(new URL(request.url).pathname),
    () => HttpResponse.json(mockInstance)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstancePeers', () => {
  test('should render peers list', async () => {
    render(
      <MemoryRouter initialEntries={['/instances/1/peers']}>
        <Routes>
          <Route path="/instances/:id/*" element={<InstancePeers />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('associate-peers')).toBeInTheDocument();
    });
  });
});
