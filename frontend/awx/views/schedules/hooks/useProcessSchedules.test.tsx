import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Schedule } from '../../../interfaces/Schedule';
import type { ScheduleFormWizard } from '../types';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { useProcessSchedule } from './useProcessSchedules';

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

describe('useProcessSchedule', () => {
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
});
