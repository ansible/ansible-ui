import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxOverview } from './AwxOverview';

const mockDashboardData = {
  inventories: {
    url: '',
    total: 0,
    total_with_inventory_source: 0,
    job_failed: 0,
    inventory_failed: 0,
  },
  inventory_sources: { ec2: { url: '', failures_url: '', label: '', total: 0, failed: 0 } },
  groups: { url: '', total: 0, inventory_failed: 0 },
  hosts: { url: '', failures_url: '', total: 0, failed: 0 },
  projects: { url: '', failures_url: '', total: 0, failed: 0 },
  scm_types: {
    git: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
    svn: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
    archive: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
  },
  users: { url: '', total: 0 },
  organizations: { url: '', total: 0 },
  teams: { url: '', total: 0 },
  credentials: { url: '', total: 0 },
  job_templates: { url: '', total: 0 },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/dashboard/'),
    () => HttpResponse.json(mockDashboardData)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxOverview', () => {
  it('should render Welcome to dashboard content', async () => {
    render(
      <MemoryRouter>
        <AwxOverview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    });
  });
});
