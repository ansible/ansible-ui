import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxRecentJobsCard } from './AwxRecentJobsCard';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('unified_jobs'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(
    ({ request }) => request.url.includes('job_templates'),
    () => HttpResponse.json({ actions: { POST: {}, GET: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('workflow_job_templates'),
    () => HttpResponse.json({ actions: { POST: {}, GET: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('inventory_sources'),
    () => HttpResponse.json({ actions: { GET: { source: { choices: [] } } } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRecentJobsCard', () => {
  it('should render Jobs card with title and subtitle', async () => {
    render(
      <MemoryRouter>
        <AwxRecentJobsCard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });
    expect(screen.getByText('Recently finished jobs')).toBeInTheDocument();
  });
});
