import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxActiveUserProvider } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { InstanceForksSlider } from './InstanceForksSlider';

const mockInstance: Instance = {
  id: 1,
  hostname: 'test-instance',
  cpu_capacity: 4,
  mem_capacity: 8,
  capacity_adjustment: '0.5',
  enabled: true,
} as Instance;

const mockInstanceDetails = {
  ...mockInstance,
  node_type: 'execution',
  node_state: 'ready',
};

const mockInstanceGroups = { count: 0, results: [], next: null, previous: null };
const mockMe = {
  count: 1,
  results: [{ id: 1, is_superuser: true, is_system_auditor: false }],
  next: null,
  previous: null,
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/instances/1/') && !request.url.includes('/instance_groups/'),
    () => HttpResponse.json(mockInstanceDetails)
  ),
  http.get(
    ({ request }) => request.url.includes('/instances/1/instance_groups/'),
    () => HttpResponse.json(mockInstanceGroups)
  ),
  http.get(
    ({ request }) => request.url.includes('/me/'),
    () => HttpResponse.json(mockMe)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceForksSlider', () => {
  it('should render slider with forks count', async () => {
    render(
      <MemoryRouter>
        <AwxActiveUserProvider>
          <InstanceForksSlider instance={mockInstance} />
        </AwxActiveUserProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('number-forks')).toBeInTheDocument();
    });
  });
});
