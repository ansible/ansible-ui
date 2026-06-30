import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeprecationData } from './useDeprecationData';

/** Wrap each hook render in a fresh SWR cache to prevent cross-test cache sharing. */
function swrWrapper({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
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

const mockEventsWithItems = {
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
  count: 2,
  results: [
    {
      id: 3,
      event: 'deprecated',
      stdout: 'Using with_items on dnf module is deprecated',
      start_line: 30,
      task: 'Install packages',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:01:00Z',
      job: 2,
    },
    {
      id: 4,
      event: 'deprecated',
      stdout: 'Using with_items on zypper module is deprecated',
      start_line: 40,
      task: 'Install packages',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:01:00Z',
      job: 2,
    },
  ],
};

const emptyJobsResponse = { results: [], count: 0 };
const emptyEventsResponse = { results: [], count: 0 };

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDeprecationData', () => {
  it('should return loading state initially', () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => new Promise(() => {})),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => new Promise(() => {}))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch and categorize deprecations', async () => {
    // Current period: return 2 jobs with events; previous period: empty
    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) return HttpResponse.json(mockJobsResponse);
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsWithItems);
        if (params.jobId === '2') return HttpResponse.json(mockEventsJob2);
        return HttpResponse.json(emptyEventsResponse);
      })
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.totalWarnings).toBe(4);
    expect(result.current.data?.affectedJobs).toBe(2);
    expect(result.current.data?.uniqueIssues).toBe(1);
    expect(result.current.data?.deprecations).toHaveLength(1);
    expect(result.current.data?.deprecations[0].type).toBe('with_items on module');
    expect(result.current.data?.deprecations[0].count).toBe(4);
    expect(result.current.data?.deprecations[0].jobIds).toEqual([1, 2]);
    expect(result.current.data?.deprecations[0].jobOccurrences).toEqual({ 1: 2, 2: 2 });
    expect(result.current.data?.deprecations[0].organizations).toEqual([
      'Engineering',
      'Operations',
    ]);
    expect(result.current.data?.deprecations[0].jobTemplates).toEqual(['Deploy App', 'Run Tests']);
    expect(result.current.data?.hasPartialData).toBe(false);
  });

  it('should return no trends for all time range', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData('all'), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.trends).toBeUndefined();
  });

  it('should handle empty results', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.totalWarnings).toBe(0);
    expect(result.current.data?.affectedJobs).toBe(0);
    expect(result.current.data?.uniqueIssues).toBe(0);
    expect(result.current.data?.deprecations).toEqual([]);
    expect(result.current.data?.hasPartialData).toBe(false);
  });

  it('should set hasPartialData when a per-job fetch fails', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(mockJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsWithItems);
        // Job 2 returns an error
        return new HttpResponse(null, { status: 403 });
      })
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.hasPartialData).toBe(true);
    expect(result.current.data?.totalWarnings).toBe(2);
  });

  it('should surface an error when the initial jobs fetch fails', async () => {
    server.use(http.get(awxAPI`/jobs/`, () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
