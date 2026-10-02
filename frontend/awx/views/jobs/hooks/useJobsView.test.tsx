import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useJobsView } from './useJobsView';

const mockJobs = [
  { id: 1, name: 'Job 1', type: 'job', status: 'successful' },
  { id: 2, name: 'Job 2', type: 'workflow_job', status: 'running' },
];

const server = setupServer(
  http.get(awxAPI`/unified_jobs/`, ({ request }) => {
    const url = new URL(request.url);
    const notLaunchType = url.searchParams.get('not__launch_type');
    if (notLaunchType === 'sync') {
      return HttpResponse.json({
        count: mockJobs.length,
        next: null,
        previous: null,
        results: mockJobs,
      });
    }
    return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useJobsView', () => {
  it('should fetch unified jobs excluding sync launch type', async () => {
    const { result } = renderHook(() => useJobsView());

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
      expect(result.current.pageItems!.length).toBe(2);
    });

    expect(result.current.pageItems![0].name).toBe('Job 1');
    expect(result.current.pageItems![1].name).toBe('Job 2');
  });

  it('should return itemCount from the API response', async () => {
    const { result } = renderHook(() => useJobsView());

    await waitFor(() => {
      expect(result.current.itemCount).toBe(2);
    });
  });

  it('should handle empty results', async () => {
    server.use(
      http.get(awxAPI`/unified_jobs/`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    );

    const { result } = renderHook(() => useJobsView());

    await waitFor(() => {
      expect(result.current.itemCount).toBe(0);
    });

    expect(result.current.pageItems).toEqual([]);
  });
});
