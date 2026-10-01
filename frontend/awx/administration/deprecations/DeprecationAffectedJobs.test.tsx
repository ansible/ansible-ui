import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { DeprecationAffectedJobs } from './DeprecationAffectedJobs';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter
      initialEntries={[`/deprecations/${encodeURIComponent('with_items on module')}/affected-jobs`]}
    >
      <Routes>
        <Route path="/deprecations/:deprecationType/affected-jobs" element={children} />
      </Routes>
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

const mockEventsJob1 = {
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
      created: '2024-01-01T00:00:00Z',
      job: 1,
    },
  ],
};

const mockEventsJob2 = {
  count: 1,
  results: [
    {
      id: 3,
      event: 'deprecated',
      stdout: 'Using with_items on dnf module is deprecated',
      start_line: 30,
      task: 'Install packages',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-02T00:00:00Z',
      job: 2,
    },
  ],
};

const mockAffectedJobsResponse = {
  results: [
    {
      id: 1,
      name: 'Job 1',
      type: 'job',
      status: 'successful',
      started: '2024-01-01T00:00:00Z',
      finished: '2024-01-01T00:05:00Z',
      occurrences: 0,
      summary_fields: { job_template: { name: 'Deploy App' } },
    },
    {
      id: 2,
      name: 'Job 2',
      type: 'job',
      status: 'failed',
      started: '2024-01-02T00:00:00Z',
      finished: '2024-01-02T00:03:00Z',
      occurrences: 0,
      summary_fields: { job_template: { name: 'Run Tests' } },
    },
  ],
  count: 2,
};

const emptyJobsResponse = { results: [], count: 0 };
const emptyEventsResponse = { results: [], count: 0 };

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DeprecationAffectedJobs', () => {
  it('should display affected jobs table when data is available', async () => {
    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('id__in')) {
          return HttpResponse.json(mockAffectedJobsResponse);
        }
        jobsFetchCount++;
        if (jobsFetchCount === 1) return HttpResponse.json(mockJobsResponse);
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsJob1);
        if (params.jobId === '2') return HttpResponse.json(mockEventsJob2);
        return HttpResponse.json(emptyEventsResponse);
      })
    );

    render(<DeprecationAffectedJobs />, { wrapper: Wrapper });

    await waitFor(
      () => {
        expect(screen.getByText('Deploy App')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByText('Run Tests')).toBeInTheDocument();
  });

  it('should display empty state when no jobs match the deprecation type', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    render(<DeprecationAffectedJobs />, { wrapper: Wrapper });

    await waitFor(
      () => {
        expect(screen.getByText('No affected jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(
      screen.getByText('No jobs have been recorded for this deprecation pattern.')
    ).toBeInTheDocument();
  });

  it('should display table column headers', async () => {
    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('id__in')) {
          return HttpResponse.json(mockAffectedJobsResponse);
        }
        jobsFetchCount++;
        if (jobsFetchCount === 1) return HttpResponse.json(mockJobsResponse);
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsJob1);
        if (params.jobId === '2') return HttpResponse.json(mockEventsJob2);
        return HttpResponse.json(emptyEventsResponse);
      })
    );

    render(<DeprecationAffectedJobs />, { wrapper: Wrapper });

    await waitFor(
      () => {
        expect(screen.getByText('Deploy App')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Occurrences' })).toBeInTheDocument();
  });

  it('should display empty state for unrecognized deprecation type', async () => {
    const UnknownWrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter
        initialEntries={[`/deprecations/${encodeURIComponent('nonexistent_type')}/affected-jobs`]}
      >
        <Routes>
          <Route path="/deprecations/:deprecationType/affected-jobs" element={children} />
        </Routes>
      </MemoryRouter>
    );

    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    render(<DeprecationAffectedJobs />, { wrapper: UnknownWrapper });

    await waitFor(
      () => {
        expect(screen.getByText('No affected jobs')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
