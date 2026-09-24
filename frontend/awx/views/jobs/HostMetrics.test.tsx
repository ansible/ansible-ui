import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { HostMetrics } from './HostMetrics';

const hostMetric = {
  id: 1,
  hostname: 'host.example.com',
  url: '/api/v2/host_metrics/1/',
  first_automation: '2024-01-01T00:00:00.000Z',
  last_automation: '2024-06-01T12:00:00.000Z',
  last_deleted: null,
  automated_counter: 3,
  deleted_counter: 0,
  deleted: false,
  used_in_inventories: 1,
};

const server = setupServer(
  http.options(awxAPI`/host_metrics/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) => request.url.includes('host_metrics'),
    () => HttpResponse.json({ count: 1, results: [hostMetric], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HostMetrics', () => {
  it('should render Host Metrics page with title', async () => {
    render(
      <MemoryRouter>
        <HostMetrics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Host Metrics')).toBeInTheDocument();
    });
  });

  it('should render a Download toolbar action', async () => {
    render(
      <MemoryRouter>
        <HostMetrics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    });
  });
});
