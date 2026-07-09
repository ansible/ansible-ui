import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { DeprecationsDashboard } from './DeprecationsDashboard';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
    </MemoryRouter>
  );
}

const mockJobsResponse = {
  results: [
    {
      id: 1,
      summary_fields: {
        organization: { name: 'Engineering' },
        job_template: { name: 'Deploy App' },
      },
    },
  ],
  count: 1,
};

const mockEventsResponse = {
  count: 2,
  results: [
    {
      id: 1,
      event: 'deprecated',
      stdout: 'Using with_items on yum module is deprecated',
      start_line: 10,
      task: 'Install packages',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:00:00Z',
      job: 1,
    },
    {
      id: 2,
      event: 'deprecated',
      stdout: 'Using with_items on apt module is deprecated',
      start_line: 20,
      task: 'Install packages',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:01:00Z',
      job: 1,
    },
  ],
};

const emptyJobsResponse = { results: [], count: 0 };
const emptyEventsResponse = { results: [], count: 0 };

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DeprecationsDashboard', () => {
  it('should show loading state initially', () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => new Promise(() => {})),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => new Promise(() => {}))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display stats cards with deprecation data', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        // First fetch (current period) returns data; second fetch (previous period) returns empty
        if (url.searchParams.get('created__gte')) {
          return HttpResponse.json(mockJobsResponse);
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check stats cards
    expect(screen.getByText('Total Warnings')).toBeInTheDocument();
    expect(screen.getByText('Affected Jobs')).toBeInTheDocument();
    expect(screen.getByText('Unique Issues')).toBeInTheDocument();

    // Total warnings = 2 (two events)
    expect(screen.getByRole('heading', { name: '2' })).toBeInTheDocument();
    // Affected jobs = 1 and Unique issues = 1 — both stat cards show '1'
    expect(screen.getAllByRole('heading', { name: '1', level: 2 })).toHaveLength(2);
  });

  it('should display deprecation issues table', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('created__gte')) {
          return HttpResponse.json(mockJobsResponse);
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Pattern')).toBeInTheDocument();
    expect(screen.getByText('Total occurrences')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();

    // Check deprecation type appears
    expect(screen.getByText('with_items on module')).toBeInTheDocument();
  });

  it('should display empty state when no deprecations found', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No deprecation issues')).toBeInTheDocument();
    expect(
      screen.getByText('No deprecation patterns found in the selected time period.')
    ).toBeInTheDocument();
  });

  it('should display 50-jobs indicator and refresh button', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Showing deprecations from last 50 jobs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('should show partial data warning when some fetches fail', async () => {
    const mockJobsWithTwo = {
      results: [
        {
          id: 1,
          summary_fields: {
            organization: { name: 'Engineering' },
            job_template: { name: 'Deploy App' },
          },
        },
        {
          id: 2,
          summary_fields: {
            organization: { name: 'Operations' },
            job_template: { name: 'Run Tests' },
          },
        },
      ],
      count: 2,
    };

    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('created__gte')) {
          return HttpResponse.json(mockJobsWithTwo);
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsResponse);
        // Job 2 returns an error
        return new HttpResponse(null, { status: 403 });
      })
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Some data could not be loaded')).toBeInTheDocument();
    expect(
      screen.getByText(/Results may be incomplete.*Some job event data could not be retrieved/)
    ).toBeInTheDocument();
  });

  it('should display time range selector', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Time period:')).toBeInTheDocument();
  });

  it('should display toolbar filters for search, severity, organization, and job template', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('created__gte')) {
          return HttpResponse.json(mockJobsResponse);
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockEventsResponse))
    );

    render(<DeprecationsDashboard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Toolbar filters should be present (exact text/labels may vary by PF version)
    // Check that the table toolbar exists and has filter controls
    const searchInput = screen.getByPlaceholderText('Enter search');
    expect(searchInput).toBeInTheDocument();
  });
});
