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

  it('should categorize with_dict deprecations', async () => {
    const mockWithDictEvents = {
      count: 1,
      results: [
        {
          id: 10,
          event: 'deprecated',
          stdout: 'Using with_dict is deprecated, use loop with dict2items',
          start_line: 5,
          task: 'Create users',
          play: 'main',
          playbook: 'users.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: { organization: { name: 'Org1' } } }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockWithDictEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations).toHaveLength(1);
    expect(result.current.data?.deprecations[0].type).toBe('with_dict loop');
  });

  it('should categorize bare variable deprecations from stdout', async () => {
    const mockBareVarEvents = {
      count: 1,
      results: [
        {
          id: 20,
          event: 'deprecated',
          stdout: 'Conditional result was a bare variable, wrap it in {{ }}',
          start_line: 15,
          task: 'Start service',
          play: 'main',
          playbook: 'setup.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockBareVarEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('Bare variables in conditionals');
  });

  it('should categorize include directive deprecations', async () => {
    const mockIncludeEvents = {
      count: 1,
      results: [
        {
          id: 30,
          event: 'deprecated',
          stdout: 'include: tasks/setup.yml is deprecated, use import_tasks',
          start_line: 25,
          task: 'Include setup',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockIncludeEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('include directive');
  });

  it('should categorize squash_actions deprecations', async () => {
    const mockSquashEvents = {
      count: 1,
      results: [
        {
          id: 40,
          event: 'deprecated',
          stdout: 'squash_actions is deprecated and will be removed',
          start_line: 35,
          task: 'Install',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockSquashEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('squash_actions');
  });

  it('should categorize hash_behaviour deprecations', async () => {
    const mockHashEvents = {
      count: 1,
      results: [
        {
          id: 50,
          event: 'deprecated',
          stdout: 'hash_behaviour is deprecated, use combine filter',
          start_line: 45,
          task: 'Set facts',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockHashEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('hash_behaviour');
  });

  it('should categorize unknown deprecations as Other deprecation', async () => {
    const mockUnknownEvents = {
      count: 1,
      results: [
        {
          id: 60,
          event: 'deprecated',
          stdout: 'Some completely unknown deprecation warning',
          start_line: 55,
          task: 'Do something',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockUnknownEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('Other deprecation');
  });

  it('should extract deprecation type from task name when stdout is empty', async () => {
    const mockTaskNameEvents = {
      count: 1,
      results: [
        {
          id: 70,
          event: 'deprecated',
          stdout: '',
          start_line: 65,
          task: 'bare conditional check',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskNameEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('Bare variables in conditionals');
  });

  it('should extract with_items from task name when stdout is empty', async () => {
    const mockTaskEvents = {
      count: 1,
      results: [
        {
          id: 75,
          event: 'deprecated',
          stdout: '',
          start_line: 70,
          task: 'Install with_items loop',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('with_items on module');
  });

  it('should extract with_dict from task name when stdout is empty', async () => {
    const mockTaskEvents = {
      count: 1,
      results: [
        {
          id: 76,
          event: 'deprecated',
          stdout: '',
          start_line: 71,
          task: 'with_dict loop over users',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('with_dict loop');
  });

  it('should assign hot severity for counts above 50', async () => {
    const manyEvents = Array.from({ length: 51 }, (_, i) => ({
      id: i + 100,
      event: 'deprecated',
      stdout: 'Using with_items on yum module is deprecated',
      start_line: i,
      task: 'Install',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:00:00Z',
      job: 1,
    }));

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: manyEvents.length, results: manyEvents })
      )
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].severity).toBe('hot');
  });

  it('should assign warm severity for counts 26-50', async () => {
    const events = Array.from({ length: 30 }, (_, i) => ({
      id: i + 200,
      event: 'deprecated',
      stdout: 'Using with_items on yum module is deprecated',
      start_line: i,
      task: 'Install',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:00:00Z',
      job: 1,
    }));

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: events.length, results: events })
      )
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].severity).toBe('warm');
  });

  it('should assign moderate severity for counts 11-25', async () => {
    const events = Array.from({ length: 15 }, (_, i) => ({
      id: i + 300,
      event: 'deprecated',
      stdout: 'Using with_items on yum module is deprecated',
      start_line: i,
      task: 'Install',
      play: 'main',
      playbook: 'site.yml',
      created: '2024-01-01T00:00:00Z',
      job: 1,
    }));

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: events.length, results: events })
      )
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].severity).toBe('moderate');
  });

  it('should compute positive trend when current period has more warnings', async () => {
    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json(mockJobsResponse);
        }
        if (jobsFetchCount === 2) {
          return HttpResponse.json({
            results: [
              {
                id: 10,
                summary_fields: {
                  organization: { name: 'Engineering' },
                  job_template: { name: 'Old Job' },
                },
              },
            ],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsWithItems);
        if (params.jobId === '2') return HttpResponse.json(mockEventsJob2);
        if (params.jobId === '10') {
          return HttpResponse.json({
            count: 1,
            results: [
              {
                id: 100,
                event: 'deprecated',
                stdout: 'Using with_items on yum module is deprecated',
                start_line: 5,
                task: 'Old task',
                play: 'main',
                playbook: 'site.yml',
                created: '2023-12-01T00:00:00Z',
                job: 10,
              },
            ],
          });
        }
        return HttpResponse.json(emptyEventsResponse);
      })
    );

    const { result } = renderHook(() => useDeprecationData('30d'), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.trends).toBeDefined();
    expect(result.current.data?.trends?.totalWarnings).toBeGreaterThan(0);
  });

  it('should use 30d time range correctly', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData('30d'), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.timeRange).toBe('30d');
  });

  it('should use 6m time range correctly', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData('6m'), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.timeRange).toBe('6m');
  });

  it('should use 1y time range correctly', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData('1y'), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.timeRange).toBe('1y');
  });

  it('should handle bare variable detection from stdout keyword', async () => {
    const mockBareEvents = {
      count: 1,
      results: [
        {
          id: 80,
          event: 'deprecated',
          stdout: 'Using a bare variable in when clause is deprecated',
          start_line: 80,
          task: 'Check condition',
          play: 'main',
          playbook: 'main.yml',
          created: '2024-01-01T00:00:00Z',
          job: 1,
        },
      ],
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) {
          return HttpResponse.json({
            results: [{ id: 1, summary_fields: {} }],
            count: 1,
          });
        }
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockBareEvents))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].type).toBe('Bare variables in conditionals');
  });

  it('should handle jobs without organization or job_template in summary_fields', async () => {
    const mockJobsNoSummary = {
      results: [{ id: 1 }],
      count: 1,
    };

    let jobsFetchCount = 0;
    server.use(
      http.get(awxAPI`/jobs/`, () => {
        jobsFetchCount++;
        if (jobsFetchCount === 1) return HttpResponse.json(mockJobsNoSummary);
        return HttpResponse.json(emptyJobsResponse);
      }),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockEventsWithItems))
    );

    const { result } = renderHook(() => useDeprecationData(), { wrapper: swrWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].organizations).toEqual([]);
    expect(result.current.data?.deprecations[0].jobTemplates).toEqual([]);
  });
});
