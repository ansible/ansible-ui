import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { InstanceSwitch } from './InstanceSwitch';

const mockInstance: Instance = {
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
  last_health_check: undefined,
  managed_by_policy: true,
};

const mockInstanceGroupsResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockMeResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      username: 'admin',
      is_superuser: true,
      is_system_auditor: false,
    },
  ],
};

const server = setupServer(
  http.get(awxAPI`/instances/1/`, () => HttpResponse.json(mockInstance)),
  http.get(awxAPI`/instances/1/instance_groups/`, () =>
    HttpResponse.json(mockInstanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/me/'),
    () => HttpResponse.json(mockMeResponse)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceSwitch', () => {
  test('should render switch for enabled instance', async () => {
    render(
      <MemoryRouter>
        <AwxActiveUserProvider>
          <InstanceSwitch instance={mockInstance} />
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await screen.findByRole('switch', { name: /enabled/i });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  test('should render switch for disabled instance', async () => {
    const disabledInstance = { ...mockInstance, enabled: false };
    render(
      <MemoryRouter>
        <AwxActiveUserProvider>
          <InstanceSwitch instance={disabledInstance} />
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await screen.findByRole('switch', { name: /disabled/i });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
