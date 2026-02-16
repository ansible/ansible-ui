import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { HostMetrics } from './HostMetrics';

const server = setupServer(
  http.options(awxAPI`/host_metrics/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) => request.url.includes('host_metrics'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
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
});
