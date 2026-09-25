import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  extractDeprecationMessages,
  extractDeprecationMessagesFromLines,
  getDeprecationOccurrences,
  JobEvent,
  useDeprecationData,
} from './useDeprecationData';

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

    const { result } = renderHook(() => useDeprecationData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch and categorize deprecations', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(mockJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ params }) => {
        if (params.jobId === '1') return HttpResponse.json(mockEventsWithItems);
        if (params.jobId === '2') return HttpResponse.json(mockEventsJob2);
        return HttpResponse.json(emptyEventsResponse);
      })
    );

    const { result } = renderHook(() => useDeprecationData());

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

  it('should handle empty results', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(emptyJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(emptyEventsResponse))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.hasPartialData).toBe(true);
    expect(result.current.data?.totalWarnings).toBe(2);
  });

  it('should surface an error when the initial jobs fetch fails', async () => {
    server.use(http.get(awxAPI`/jobs/`, () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: { organization: { name: 'Org1' } } }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockWithDictEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockBareVarEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockIncludeEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockSquashEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockHashEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockUnknownEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskNameEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockTaskEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: manyEvents.length, results: manyEvents })
      )
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: events.length, results: events })
      )
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: events.length, results: events })
      )
    );

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].severity).toBe('moderate');
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

    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({
          results: [{ id: 1, summary_fields: {} }],
          count: 1,
        })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockBareEvents))
    );

    const { result } = renderHook(() => useDeprecationData());

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

    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(mockJobsNoSummary)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () => HttpResponse.json(mockEventsWithItems))
    );

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.deprecations[0].organizations).toEqual([]);
    expect(result.current.data?.deprecations[0].jobTemplates).toEqual([]);
  });

  it('should add page_size=200 to job events requests', async () => {
    const capturedEventUrls: string[] = [];
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(mockJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ request }) => {
        capturedEventUrls.push(request.url);
        return HttpResponse.json(mockEventsWithItems);
      })
    );

    const { result } = renderHook(() => useDeprecationData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(capturedEventUrls.length).toBeGreaterThan(0);
    capturedEventUrls.forEach((url) => {
      expect(new URL(url).searchParams.get('page_size')).toBe('200');
    });
  });
  it('should query markers, search and the verbose stream without filtering on stdout', async () => {
    const capturedEventUrls: string[] = [];
    server.use(
      http.get(awxAPI`/jobs/`, () => HttpResponse.json(mockJobsResponse)),
      http.get(awxAPI`/jobs/:jobId/job_events/`, ({ request }) => {
        capturedEventUrls.push(request.url);
        return HttpResponse.json(mockEventsWithItems);
      })
    );

    const { result } = renderHook(() => useDeprecationData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const queries = capturedEventUrls.map((url) => new URL(url).searchParams);
    expect(queries.some((q) => q.get('event') === 'deprecated')).toBe(true);
    expect(queries.some((q) => q.get('search') === 'DEPRECATION')).toBe(true);
    expect(queries.some((q) => q.get('event__in') === 'deprecated,verbose')).toBe(true);
    queries.forEach((q) => {
      expect([...q.keys()].some((key) => key.includes('stdout'))).toBe(false);
    });
  });

  it('should rebuild messages from AAP verbose events, one wrapped line per event', async () => {
    server.use(
      http.get(awxAPI`/jobs/`, () =>
        HttpResponse.json({ results: [mockJobsResponse.results[0]], count: 1 })
      ),
      http.get(awxAPI`/jobs/:jobId/job_events/`, () =>
        HttpResponse.json({ count: aapEvents.length, next: null, results: aapEvents })
      )
    );

    const { result } = renderHook(() => useDeprecationData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.totalWarnings).toBe(2);
    expect(result.current.data?.deprecations.map((d) => [d.type, d.count]).sort()).toEqual([
      ['Bare variables in conditionals', 1],
      ['with_dict loop', 1],
    ]);
  });
});

const PURPLE = '\u001b[0;35m';
const RESET = '\u001b[0m';

function event(overrides: Partial<JobEvent>): JobEvent {
  return {
    id: 0,
    event: 'verbose',
    stdout: '',
    start_line: 0,
    task: '',
    play: '',
    playbook: 'site.yml',
    created: '2026-01-01T00:00:00Z',
    job: 1,
    ...overrides,
  };
}

// Real AAP 2.7 / ansible-core 2.16 shape: empty deprecated marker, then one verbose event per wrapped line
const aapEvents: JobEvent[] = [
  event({ id: 10, counter: 7, event: 'deprecated' }),
  event({
    id: 11,
    counter: 8,
    stdout: `${PURPLE}[DEPRECATION WARNING]: with_dict is deprecated. Use loop with the dict2items ${RESET}`,
  }),
  event({
    id: 12,
    counter: 9,
    stdout: `${PURPLE}filter instead. This feature will be removed in version 2.23.${RESET}`,
  }),
  event({ id: 13, counter: 11, event: 'deprecated' }),
  event({
    id: 14,
    counter: 12,
    stdout: `${PURPLE}[DEPRECATION WARNING]: evaluating 'install_packages' as a bare variable, this ${RESET}`,
  }),
  event({ id: 15, counter: 13, stdout: `${PURPLE}behaviour will go away.${RESET}` }),
  event({ id: 16, counter: 14, stdout: '\u001b[0;32mok: [localhost] => with_items\u001b[0m' }),
];

// Real ansible-core 2.20 runner_on_ok output: deprecations, source context, then the task result
const runnerOnOk220 =
  `${PURPLE}[DEPRECATION WARNING]: Empty conditional expression was evaluated as True. This feature will be removed in the future.${RESET}\r\n` +
  `${PURPLE}Origin: /runner/project/tasks/real_task_time.yml:26:9${RESET}\r\n` +
  `${PURPLE}${RESET}\r\n` +
  `${PURPLE}26   when: with_items${RESET}\r\n` +
  `${PURPLE}${RESET}\r\n` +
  `${PURPLE}[DEPRECATION WARNING]: The \`bool\` filter coerced invalid value 'maybe' (str) to False.${RESET}\r\n` +
  '\u001b[0;32mok: [localhost] => {\u001b[0m\r\n' +
  '\u001b[0;32m    "msg": "with_dict"\u001b[0m\r\n' +
  '\u001b[0;32m}\u001b[0m';

describe('extractDeprecationMessagesFromLines', () => {
  it('re-joins lines of the same colour and stops at a different colour', () => {
    expect(
      extractDeprecationMessagesFromLines([
        `${PURPLE}[DEPRECATION WARNING]: evaluating 'x' as a bare variable, this ${RESET}`,
        `${PURPLE}behaviour will go away.${RESET}`,
        '\u001b[0;32mok: [localhost]\u001b[0m',
      ])
    ).toEqual([
      "[DEPRECATION WARNING]: evaluating 'x' as a bare variable, this behaviour will go away.",
    ]);
  });

  it('stops at a hard break', () => {
    expect(
      extractDeprecationMessagesFromLines([
        `${PURPLE}[DEPRECATION WARNING]: a ${RESET}`,
        null,
        `${PURPLE}b${RESET}`,
      ])
    ).toEqual(['[DEPRECATION WARNING]: a']);
  });
});

describe('extractDeprecationMessages', () => {
  it('splits several deprecations in one event and ignores source context and task output', () => {
    const messages = extractDeprecationMessages(runnerOnOk220);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain('Empty conditional expression');
    expect(messages[0]).not.toContain('with_items');
    expect(messages[1]).toContain('The `bool` filter coerced');
    expect(messages[1]).not.toContain('with_dict');
  });

  it('returns nothing for events without a deprecation', () => {
    expect(extractDeprecationMessages('')).toEqual([]);
    expect(extractDeprecationMessages('ok: [localhost]')).toEqual([]);
  });
});

describe('getDeprecationOccurrences', () => {
  it('counts each AAP marker once, using the text from the verbose events', () => {
    const occurrences = getDeprecationOccurrences(aapEvents);
    expect(occurrences.map((o) => o.text)).toEqual([
      '[DEPRECATION WARNING]: with_dict is deprecated. Use loop with the dict2items filter instead. This feature will be removed in version 2.23.',
      "[DEPRECATION WARNING]: evaluating 'install_packages' as a bare variable, this behaviour will go away.",
    ]);
  });

  it('ignores duplicate events returned by more than one query', () => {
    expect(getDeprecationOccurrences([...aapEvents, ...aapEvents])).toHaveLength(2);
  });

  it('reads deprecations inside task result events with the task name', () => {
    const occurrences = getDeprecationOccurrences([
      event({
        id: 1,
        counter: 3,
        event: 'runner_on_ok',
        task: 'Check flags',
        stdout: runnerOnOk220,
      }),
    ]);
    expect(occurrences).toHaveLength(2);
    expect(occurrences[0].task).toBe('Check flags');
  });

  it('still counts empty deprecated markers when no text is available', () => {
    const occurrences = getDeprecationOccurrences([
      event({ id: 1, counter: 1, event: 'deprecated', task: 'Install with_items' }),
      event({ id: 2, counter: 5, event: 'deprecated' }),
    ]);
    expect(occurrences).toEqual([
      { text: '', task: 'Install with_items' },
      { text: '', task: '' },
    ]);
  });

  it('skips the ansible-core 2.20 "deprecation warnings can be disabled" notice', () => {
    const occurrences = getDeprecationOccurrences([
      event({
        id: 1,
        counter: 1,
        event: 'deprecated',
        stdout: '[WARNING]: Deprecation warnings can be disabled',
      }),
    ]);
    expect(occurrences).toEqual([]);
  });
});
