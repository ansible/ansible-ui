import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Schedule } from '../../../interfaces/Schedule';
import type { ScheduleFormWizard, SchedulePromptValues as PromptFormValues } from '../types';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { useProcessSchedule } from './useProcessSchedules';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';

const mockScheduleResponse: Schedule = {
  id: 99,
  name: 'Test Schedule',
  rrule: 'DTSTART:20230101T000000Z RRULE:FREQ=DAILY;INTERVAL=1',
  dtstart: '2023-01-01T00:00:00Z',
  timezone: 'UTC',
  enabled: true,
  created: '2023-01-01T00:00:00Z',
  modified: '2023-01-01T00:00:00Z',
  skip_tags: '',
  job_tags: '',
  related: { unified_job_template: '/api/v2/job_templates/1/' },
  summary_fields: {
    unified_job_template: {
      id: 1,
      name: 'Test JT',
      description: '',
      unified_job_type: 'job',
      job_type: 'run',
    },
    user_capabilities: { edit: true, delete: true },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
  },
  extra_data: {},
} as Schedule;

const postCalls: { url: string; body: unknown; method: string }[] = [];

const server = setupServer(
  http.post(awxAPI`/job_templates/:id/schedules/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'POST', body });
    return HttpResponse.json(mockScheduleResponse, { status: 201 });
  }),
  http.post(awxAPI`/projects/:id/schedules/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'POST', body });
    return HttpResponse.json(mockScheduleResponse, { status: 201 });
  }),
  http.post(awxAPI`/inventory_sources/:id/schedules/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'POST', body });
    return HttpResponse.json(mockScheduleResponse, { status: 201 });
  }),
  http.post(awxAPI`/system_job_templates/:id/schedules/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'POST', body });
    return HttpResponse.json(mockScheduleResponse, { status: 201 });
  }),
  http.post(awxAPI`/workflow_job_templates/:id/schedules/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'POST', body });
    return HttpResponse.json(mockScheduleResponse, { status: 201 });
  }),
  http.patch(awxAPI`/schedules/:id/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, method: 'PATCH', body });
    return HttpResponse.json(mockScheduleResponse);
  }),
  http.get(awxAPI`/schedules/:id/credentials/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/schedules/:id/instance_groups/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.post(awxAPI`/schedules/:id/credentials/`, () => HttpResponse.json({}, { status: 204 })),
  http.post(awxAPI`/schedules/:id/instance_groups/`, () => HttpResponse.json({}, { status: 204 })),
  http.post(awxAPI`/schedules/:id/labels/`, () => HttpResponse.json({}, { status: 204 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  postCalls.length = 0;
});
afterAll(() => server.close());

function wrapper(routePath: string, initialEntry: string) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={routePath} element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );
  };
}

const rruleString = 'DTSTART:20230101T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1';

function makePayload(
  resourceType: string,
  overrides: Partial<ScheduleFormWizard> = {}
): ScheduleFormWizard {
  return {
    name: 'Test Schedule',
    description: 'desc',
    schedule_type: 'rrule',
    timezone: 'UTC',
    startDateTime: { date: '2023-01-01', time: '00:00' },
    resource: {
      id: 10,
      type: resourceType,
      name: 'Resource',
      organization: 5,
    } as unknown as ScheduleFormWizard['resource'],
    resourceId: 10,
    rules: [{ id: 1, rule: rruleString }],
    exceptions: [],
    launch_config: null,
    prompt: undefined as unknown as PromptFormValues,
    schedule_days_to_keep: 0,
    survey: {},
    enabled: true,
    ...overrides,
  };
}

function makePrompt(overrides: Partial<PromptFormValues>): PromptFormValues {
  return {
    credentials: [],
    instance_groups: [],
    execution_environment: {},
    diff_mode: false,
    extra_vars: '',
    forks: 0,
    job_slice_count: 1,
    job_tags: [],
    job_type: 'run',
    labels: [],
    limit: '',
    scm_branch: '',
    skip_tags: [],
    timeout: 0,
    verbosity: 0,
    ...overrides,
  };
}

describe('useProcessSchedule', () => {
  it.each([
    ['job_template', false],
    ['job_template', true],
    ['workflow_job_template', false],
    ['workflow_job_template', true],
  ] as const)('reconciles labels once after saving %s (edit: %s)', async (type, edit) => {
    const events: string[] = [];
    const labelPosts: unknown[] = [];
    server.use(
      http.get(awxAPI`/schedules/99/labels/`, () => {
        expect(postCalls).toHaveLength(1);
        events.push('labels');
        return HttpResponse.json({
          results: [{ id: 1, name: 'retained', organization: 5 }],
          next: null,
        });
      }),
      http.post(awxAPI`/schedules/99/labels/`, async ({ request }) => {
        labelPosts.push(await request.json());
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(awxAPI`/schedules/99/credentials/`, () => {
        events.push('credentials');
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(awxAPI`/schedules/99/instance_groups/`, () => {
        events.push('instance_groups');
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: edit
        ? wrapper('/templates/:id/schedules/:schedule_id/edit', '/templates/10/schedules/99/edit')
        : wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });
    const payload = makePayload(type, {
      prompt: makePrompt({
        labels: [{ id: 1, name: 'retained' }, { name: 'new' }],
        organization: 99,
        credentials: [{ id: 7, name: 'SSH', credential_type: 1, passwords_needed: [] }],
        instance_groups: [{ id: 8, name: 'group' }] as PromptFormValues['instance_groups'],
      }),
      launch_config: {
        ask_labels_on_launch: false,
        ask_instance_groups_on_launch: true,
        defaults: { credentials: [], labels: [{ id: 12, name: 'not-schedule-state' }] },
      } as unknown as LaunchConfiguration,
    });

    const response = await result.current(payload);

    expect(response.schedule.id).toBe(99);
    expect(postCalls[0].method).toBe(edit ? 'PATCH' : 'POST');
    expect(postCalls[0].body).not.toHaveProperty('launch_config');
    expect(postCalls[0].body).not.toHaveProperty('unified_job_template');
    expect(labelPosts).toEqual([{ name: 'new', organization: 5 }]);
    expect(events).toEqual(['labels', 'credentials', 'instance_groups']);
  });

  it('rejects the save through the form error adapter when reconciliation fails', async () => {
    server.use(
      http.get(awxAPI`/schedules/99/labels/`, () => HttpResponse.json({ results: [], next: null })),
      http.post(awxAPI`/schedules/99/labels/`, () =>
        HttpResponse.json({ detail: 'Permission denied' }, { status: 403 })
      )
    );
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });
    const payload = makePayload('job_template', {
      prompt: { labels: [{ id: 2, name: 'rejected' }] } as PromptFormValues,
      launch_config: { ask_labels_on_launch: false } as LaunchConfiguration,
    });

    const error = await result.current(payload).catch((error: unknown) => error);

    expect(postCalls).toHaveLength(1);
    expect(awxErrorAdapter(error).genericErrors[0].message).toContain('Failed to add');
    expect(awxErrorAdapter(error).genericErrors[0].message).toContain('Permission denied');
  });

  it('retries a partially created schedule without creating another schedule', async () => {
    let fail = true;
    let labelReads = 0;
    server.use(
      http.get(awxAPI`/schedules/99/labels/`, () => {
        labelReads++;
        return HttpResponse.json({ results: [], next: null });
      }),
      http.post(awxAPI`/schedules/99/labels/`, () =>
        fail
          ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
          : new HttpResponse(null, { status: 204 })
      )
    );
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });
    const payload = makePayload('job_template', {
      prompt: makePrompt({ labels: [{ id: 2, name: 'retry' }] }),
    });
    await expect(result.current(payload)).rejects.toThrow('Failed to add');
    fail = false;
    await expect(result.current(payload)).resolves.toMatchObject({ schedule: { id: 99 } });
    expect(postCalls.map(({ method }) => method)).toEqual(['POST', 'PATCH']);
    expect(labelReads).toBe(2);
  });

  it.each(['inventory_source', 'project', 'system_job_template'])(
    'does not reconcile labels for %s',
    async (type) => {
      let labelReads = 0;
      server.use(
        http.get(awxAPI`/schedules/99/labels/`, () => {
          labelReads++;
          return HttpResponse.json({ results: [], next: null });
        })
      );
      const { result } = renderHook(() => useProcessSchedule(), {
        wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
      });

      await result.current(
        makePayload(type, { prompt: { labels: [] } as unknown as PromptFormValues })
      );

      expect(labelReads).toBe(0);
    }
  );

  it('should POST to inventory_sources endpoint for inventory_source type', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const response = await result.current(makePayload('inventory_source'));
    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/inventory_sources/');
  });

  it('should POST to projects endpoint for project type', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const response = await result.current(makePayload('project'));
    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/projects/');
  });

  it('should POST to system_job_templates endpoint with extra_data for system_job_template', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const payload = makePayload('system_job_template', { schedule_days_to_keep: 90 });
    const response = await result.current(payload);

    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/system_job_templates/');
    expect((postCalls[0].body as Record<string, unknown>).extra_data).toEqual({ days: 90 });
  });

  it('should POST to job_templates endpoint for default type', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const response = await result.current(makePayload('job_template'));
    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/job_templates/');
  });

  it('should POST to workflow_job_templates endpoint for workflow_job_template type', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const response = await result.current(makePayload('workflow_job_template'));
    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/workflow_job_templates/');
  });

  it('should PATCH existing schedule when schedule_id param exists', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper(
        '/templates/:id/schedules/:schedule_id/edit',
        '/templates/10/schedules/99/edit'
      ),
    });

    const response = await result.current(makePayload('job_template'));
    expect(response.schedule).toBeDefined();
    expect(postCalls[0].method).toBe('PATCH');
    expect(postCalls[0].url).toContain('/schedules/99/');
  });

  it('should include prompt data for job_template with launch_config', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const payload = makePayload('job_template', {
      prompt: {
        inventory: { id: 5 },
        extra_vars: '{"key": "val"}',
      } as unknown as PromptFormValues,
      launch_config: {
        ask_inventory_on_launch: true,
        ask_variables_on_launch: true,
      } as unknown as LaunchConfiguration,
      survey: { q1: 'a1' },
    });

    const response = await result.current(payload);
    expect(response.schedule).toBeDefined();
  });

  it('should append Z to UNTIL date when DTSTART has TZID', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    // DTSTART with TZID + UNTIL: the rrule library strips the Z suffix on serialization
    const tzidRule =
      'DTSTART;TZID=America/New_York:20230101T000000\nRRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20231231T050000Z';

    const payload = makePayload('job_template', {
      rules: [{ id: 1, rule: tzidRule }],
    });

    await result.current(payload);

    const savedRRule = (postCalls[0].body as Record<string, unknown>).rrule as string;
    expect(savedRRule).toMatch(/UNTIL=\d{8}T\d{6}Z/);
  });

  it('should POST to system_job_templates with empty extra_data when schedule_days_to_keep is undefined', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const payload = makePayload('system_job_template', {
      schedule_days_to_keep: undefined as unknown as number,
    });

    const response = await result.current(payload);

    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/system_job_templates/');
    expect((postCalls[0].body as Record<string, unknown>).extra_data).toEqual({});
  });

  it('should fall back to empty survey for workflow_job_template when survey is undefined', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const payload = makePayload('workflow_job_template', {
      survey: undefined as unknown as Record<string, string | number | string[]>,
    });

    const response = await result.current(payload);

    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/workflow_job_templates/');
  });

  it('should fall back to empty survey for job_template when survey is undefined', async () => {
    const { result } = renderHook(() => useProcessSchedule(), {
      wrapper: wrapper('/templates/:id/schedules/create', '/templates/10/schedules/create'),
    });

    const payload = makePayload('job_template', {
      survey: undefined as unknown as Record<string, string | number | string[]>,
    });

    const response = await result.current(payload);

    expect(response.schedule).toBeDefined();
    expect(postCalls[0].url).toContain('/job_templates/');
  });
});
