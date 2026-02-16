import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { InstanceGroupInstancesPage } from './InstanceGroupInstancesPage';

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

const mockInstanceGroup = {
  id: 1,
  name: 'test-instance-group',
  type: 'instance_group',
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/instances/') &&
      request.url.includes('/1') &&
      !request.url.includes('/instance_groups'),
    () => HttpResponse.json(mockInstance)
  ),
  http.get(
    ({ request }) => request.url.includes('/instance_groups/') && request.url.includes('/1'),
    () => HttpResponse.json(mockInstanceGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupInstancesPage', () => {
  test('should render page with instance hostname as title', async () => {
    render(
      <MemoryRouter initialEntries={['/instance_groups/1/instances/1/details']}>
        <Routes>
          <Route
            path="/instance_groups/:id/instances/:instance_id/*"
            element={<InstanceGroupInstancesPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'test-instance' })).toBeInTheDocument();
  });
});
