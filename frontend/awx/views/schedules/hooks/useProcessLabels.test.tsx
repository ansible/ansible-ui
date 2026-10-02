import { renderHook } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { Label } from '../../../interfaces/Label';
import { useProcessLabels } from './useProcessLabels';

const postCalls: { url: string; body: unknown }[] = [];

const server = setupServer(
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'Default' }] })
  ),
  http.get(awxAPI`/labels/`, () => HttpResponse.json({ count: 0, results: [] })),
  http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  ),
  http.post(awxAPI`/schedules/:scheduleId/labels/`, async ({ request }) => {
    const body = await request.json();
    postCalls.push({ url: request.url, body });
    return HttpResponse.json({}, { status: 204 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  postCalls.length = 0;
});
afterAll(() => server.close());

function makeLaunchConfig(overrides: Partial<LaunchConfiguration> = {}): LaunchConfiguration {
  return {
    can_start_without_user_input: true,
    passwords_needed_to_start: [],
    variables_needed_to_start: [],
    credential_needed_to_start: false,
    inventory_needed_to_start: false,
    ask_scm_branch_on_launch: false,
    ask_variables_on_launch: false,
    ask_tags_on_launch: false,
    ask_diff_mode_on_launch: false,
    ask_skip_tags_on_launch: false,
    ask_job_type_on_launch: false,
    ask_limit_on_launch: false,
    ask_verbosity_on_launch: false,
    ask_inventory_on_launch: false,
    ask_credential_on_launch: false,
    ask_execution_environment_on_launch: false,
    ask_labels_on_launch: false,
    ask_forks_on_launch: false,
    ask_job_slice_count_on_launch: false,
    ask_timeout_on_launch: false,
    ask_instance_groups_on_launch: false,
    survey_enabled: false,
    credential_passwords: {},
    unified_job_template_object: { name: 'Test', id: 1, description: '', survey_enabled: false },
    job_template_data: { name: 'Test', id: 1, description: '' },
    defaults: {
      inventory: { name: 'Inv', id: 1 },
      limit: '',
      scm_branch: '',
      labels: [],
      job_tags: '',
      skip_tags: '',
      extra_vars: '',
      diff_mode: false,
      job_type: 'run',
      verbosity: 0,
      credentials: [],
      execution_environment: {},
      forks: 0,
      job_slice_count: 1,
      timeout: 0,
      instance_groups: [],
    },
    ...overrides,
  } as LaunchConfiguration;
}

describe('useProcessLabels', () => {
  it('should associate and disassociate labels when ask_labels_on_launch is true', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [{ id: 1, name: 'existing-label' }],
      },
    });

    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'existing-label' }] })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'new-label', id: 2 }] as unknown as Label[], config, 5);

    const disassociateCall = postCalls.find(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    const associateCall = postCalls.find(
      (c) => (c.body as Record<string, unknown>).name === 'new-label'
    );

    expect(disassociateCall).toBeDefined();
    expect((disassociateCall?.body as Record<string, unknown>).id).toBe(1);
    expect(associateCall).toBeDefined();
  });

  it('should disassociate multiple labels in parallel', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [
          { id: 1, name: 'label-1' },
          { id: 2, name: 'label-2' },
          { id: 3, name: 'label-3' },
        ],
      },
    });

    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({
          count: 3,
          results: [
            { id: 1, name: 'label-1' },
            { id: 2, name: 'label-2' },
            { id: 3, name: 'label-3' },
          ],
        })
      )
    );
    let activeRequests = 0;
    let maximumActiveRequests = 0;
    server.use(
      http.post(awxAPI`/schedules/:scheduleId/labels/`, async ({ request }) => {
        activeRequests += 1;
        maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
        const body = await request.json();
        await new Promise((resolve) => setTimeout(resolve, 0));
        activeRequests -= 1;
        postCalls.push({ url: request.url, body });
        return HttpResponse.json({}, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [], config);

    expect(maximumActiveRequests).toBe(3);
    expect(postCalls).toHaveLength(3);
    expect(postCalls.map((call) => (call.body as { id: number }).id)).toEqual([1, 2, 3]);
  });

  it('should only disassociate each duplicate label once', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [
          { id: 1, name: 'label-1' },
          { id: 1, name: 'label-1' },
        ],
      },
    });

    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({
          count: 2,
          results: [
            { id: 1, name: 'label-1' },
            { id: 1, name: 'label-1' },
          ],
        })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [], config);

    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].body).toEqual({ id: 1, disassociate: true });
  });

  it('should disassociate existing labels when ask_labels_on_launch is false', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: false,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [
          { id: 1, name: 'label-1' },
          { id: 2, name: 'label-2' },
        ],
      },
    });

    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({
          count: 2,
          results: [
            { id: 1, name: 'label-1' },
            { id: 2, name: 'label-2' },
          ],
        })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [], config);

    expect(postCalls).toHaveLength(2);
    postCalls.forEach((call) => {
      expect((call.body as Record<string, unknown>).disassociate).toBe(true);
    });
  });

  it('should associate labels when ask_labels_on_launch is false', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: false,
      defaults: { ...makeLaunchConfig().defaults, labels: [] },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ id: 2, name: 'schedule-label' }] as Label[], config, 5);

    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].body).toEqual({ name: 'schedule-label', organization: 5 });
  });

  it('should preserve an existing label selected without its id', async () => {
    const config = makeLaunchConfig({
      defaults: { ...makeLaunchConfig().defaults, labels: [{ id: 2, name: 'schedule-label' }] },
    });

    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 2, name: 'schedule-label' }] })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'schedule-label' }] as unknown as Label[], config);

    expect(postCalls).toHaveLength(0);
  });

  it('should fetch default organization when none is provided', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [],
      },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'new-label-no-id' }] as unknown as Label[], config, null);

    const createCall = postCalls.find(
      (c) => (c.body as Record<string, unknown>).name === 'new-label-no-id'
    );
    expect(createCall).toBeDefined();
    expect((createCall?.body as Record<string, unknown>).organization).toBe(1);
  });

  it('should do nothing when ask_labels_on_launch is false and no existing labels', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: false,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [],
      },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [] as unknown as Label[], config);

    expect(postCalls).toHaveLength(0);
  });

  it('should use the label organization when provided', async () => {
    const config = makeLaunchConfig({
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [],
      },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(
      42,
      [{ name: 'org-label', organization: 99 }] as unknown as Label[],
      config
    );

    expect(postCalls[0].body).toEqual({ name: 'org-label', organization: 99 });
  });

  it('should process labels when launch configuration is null', async () => {
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ id: 2, name: 'schedule-label' }] as Label[], null, 5);

    expect(postCalls[0].body).toEqual({ name: 'schedule-label', organization: 5 });
  });

  it('should use empty default labels when launch configuration has no defaults', async () => {
    const { result } = renderHook(() => useProcessLabels());

    await result.current(
      42,
      [{ id: 2, name: 'schedule-label' }] as Label[],
      { ask_labels_on_launch: true } as LaunchConfiguration,
      5
    );

    expect(postCalls[0].body).toEqual({ name: 'schedule-label', organization: 5 });
  });

  it('should fall back to organization 1 when the default organization has no id', async () => {
    server.use(
      http.get(awxAPI`/organizations/`, () => HttpResponse.json({ count: 1, results: [{}] }))
    );
    const config = makeLaunchConfig({
      defaults: { ...makeLaunchConfig().defaults, labels: [] },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'fallback-label' }] as unknown as Label[], config);

    expect(postCalls[0].body).toEqual({ name: 'fallback-label', organization: 1 });
  });

  it('should use provided organization instead of fetching default', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [],
      },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'org-label' }] as unknown as Label[], config, 99);

    const createCall = postCalls.find(
      (c) => (c.body as Record<string, unknown>).name === 'org-label'
    );
    expect(createCall).toBeDefined();
    expect((createCall?.body as Record<string, unknown>).organization).toBe(99);
  });

  it('should resolve a new label from all available labels', async () => {
    server.use(
      http.get(awxAPI`/labels/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 7, name: 'available-label', organization: 5 }],
        })
      )
    );
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: { ...makeLaunchConfig().defaults, labels: [] },
    });

    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ name: 'available-label' }] as unknown as Label[], config, 5);

    expect(postCalls[0].body).toEqual({ name: 'available-label', organization: 5 });
  });

  it('should process paginated schedule labels', async () => {
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, ({ request }) => {
        if (new URL(request.url).searchParams.has('page')) {
          return HttpResponse.json({ count: 1, results: [{ id: 2, name: 'second-label' }] });
        }
        return HttpResponse.json({
          count: 1,
          next: awxAPI`/schedules/42/labels/?page=2`,
          results: [{ id: 1, name: 'first-label' }],
        });
      })
    );
    const config = makeLaunchConfig({ ask_labels_on_launch: false });
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [], config);

    expect(postCalls.map((call) => (call.body as { id: number }).id)).toEqual([1, 2]);
  });

  it('should stop after disassociating labels in disassociate phase', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: false,
      defaults: { ...makeLaunchConfig().defaults, labels: [] },
    });
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'existing-label' }] })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [{ id: 2, name: 'new-label' }] as unknown as Label[], config, 5);

    expect(postCalls).toHaveLength(2);
    expect(postCalls[0].body).toEqual({ id: 1, disassociate: true });
    expect(postCalls[1].body).toEqual({ name: 'new-label', organization: 5 });
  });

  it('should ignore a missing label during disassociation', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [{ id: 1, name: 'missing-label' }],
      },
    });
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'missing-label' }] })
      ),
      http.post(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ detail: 'Label matching query does not exist' }, { status: 404 })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, [], config)).resolves.toBeUndefined();
  });

  it('should rethrow unexpected disassociation errors', async () => {
    const config = makeLaunchConfig({
      ask_labels_on_launch: true,
      defaults: {
        ...makeLaunchConfig().defaults,
        labels: [{ id: 1, name: 'label' }],
      },
    });
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'label' }] })
      ),
      http.post(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ detail: 'Unexpected failure' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, [], config)).rejects.toThrow('Internal Server Error');
  });

  it.each([false, true])(
    'should remove A, retain B without reposting it, and add C when prompting is %s',
    async (ask_labels_on_launch) => {
      server.use(
        http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
          HttpResponse.json({
            count: 2,
            results: [
              { id: 1, name: 'A', organization: 5 },
              { id: 2, name: 'B', organization: 5 },
            ],
          })
        )
      );
      const { result } = renderHook(() => useProcessLabels());

      await result.current(
        42,
        [
          { id: 2, name: 'B' },
          { id: 0, name: 'C' },
        ],
        makeLaunchConfig({ ask_labels_on_launch }),
        5
      );

      expect(postCalls.map((call) => call.body)).toEqual([
        { id: 1, disassociate: true },
        { name: 'C', organization: 5 },
      ]);
    }
  );

  it.each([
    { name: 'explicit label organization', label: { id: 0, name: 'shared', organization: 5 } },
    { name: 'resource organization', label: { id: 0, name: 'shared' } },
  ])('should isolate same-name labels using $name', async ({ label }) => {
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 1, name: 'shared', organization: 9 }],
        })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(42, [label], makeLaunchConfig(), 5);

    expect(postCalls.map((call) => call.body)).toEqual([
      { id: 1, disassociate: true },
      { name: 'shared', organization: 5 },
    ]);
  });

  it.each([false, true])(
    'should reject a schedule-label GET failure without mutating labels (later page: %s)',
    async (laterPage) => {
      server.use(
        http.get(awxAPI`/schedules/:scheduleId/labels/`, ({ request }) => {
          if (laterPage && !new URL(request.url).searchParams.has('page')) {
            return HttpResponse.json({
              count: 2,
              next: awxAPI`/schedules/42/labels/?page=2`,
              results: [{ id: 1, name: 'A' }],
            });
          }
          return HttpResponse.json({ detail: 'Cannot load labels' }, { status: 500 });
        })
      );
      const { result } = renderHook(() => useProcessLabels());

      await expect(
        result.current(42, [{ id: 0, name: 'C' }], makeLaunchConfig(), 5)
      ).rejects.toThrow('Internal Server Error');

      expect(postCalls).toEqual([]);
    }
  );

  it('should reject an organization GET failure before removing or adding labels', async () => {
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: 1, results: [{ id: 1, name: 'A' }] })
      ),
      http.get(awxAPI`/organizations/`, () =>
        HttpResponse.json({ detail: 'Cannot load organizations' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, [{ id: 0, name: 'C' }], makeLaunchConfig())).rejects.toThrow(
      'Internal Server Error'
    );

    expect(postCalls).toEqual([]);
  });

  it('should surface association failure and retry without duplicating a successful association', async () => {
    const associated: { id: number; name: string; organization: number }[] = [];
    let fail = true;
    server.use(
      http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
        HttpResponse.json({ count: associated.length, results: associated })
      ),
      http.post(awxAPI`/schedules/:scheduleId/labels/`, async ({ request }) => {
        const body = (await request.json()) as { name: string; organization: number };
        postCalls.push({ url: request.url, body });
        await delay(10);
        if (body.name === 'C' && fail) {
          return HttpResponse.json({ detail: 'Association failed' }, { status: 500 });
        }
        associated.push({ id: associated.length + 1, ...body });
        return new HttpResponse(null, { status: 204 });
      })
    );
    const labels = [
      { id: 0, name: 'B' },
      { id: 0, name: 'C' },
    ];
    const { result } = renderHook(() => useProcessLabels());

    await expect(result.current(42, labels, makeLaunchConfig(), 5)).rejects.toThrow(
      'Internal Server Error'
    );
    expect(associated.map((label) => label.name)).toEqual(['B']);
    fail = false;
    await result.current(42, labels, makeLaunchConfig(), 5);

    expect(postCalls.map((call) => call.body)).toEqual([
      { name: 'B', organization: 5 },
      { name: 'C', organization: 5 },
      { name: 'C', organization: 5 },
    ]);
    expect(associated.map((label) => label.name)).toEqual(['B', 'C']);
  });

  it.each([false, true])(
    'should await every delayed disassociation before continuing (failure: %s)',
    async (fail) => {
      const events: string[] = [];
      server.use(
        http.get(awxAPI`/schedules/:scheduleId/labels/`, () =>
          HttpResponse.json({
            count: 2,
            results: [
              { id: 1, name: 'A' },
              { id: 2, name: 'B' },
            ],
          })
        ),
        http.post(awxAPI`/schedules/:scheduleId/labels/`, async ({ request }) => {
          const body = (await request.json()) as {
            id?: number;
            disassociate?: boolean;
            name?: string;
          };
          if (body.disassociate) {
            events.push(`start:${body.id}`);
            await delay(body.id === 1 ? 10 : 50);
            events.push(`end:${body.id}`);
            if (fail && body.id === 1) {
              return HttpResponse.json({ detail: 'Cleanup failed' }, { status: 500 });
            }
          } else {
            events.push(`associate:${body.name}`);
          }
          return new HttpResponse(null, { status: 204 });
        })
      );
      const { result } = renderHook(() => useProcessLabels());
      const processing = result.current(42, [{ id: 0, name: 'C' }], makeLaunchConfig(), 5);

      if (fail) {
        await expect(processing).rejects.toThrow('Internal Server Error');
      } else {
        await processing;
      }

      expect(events).toEqual([
        'start:1',
        'start:2',
        'end:1',
        'end:2',
        ...(fail ? [] : ['associate:C']),
      ]);
    }
  );

  it('should complete each delayed association before starting the next', async () => {
    const events: string[] = [];
    server.use(
      http.post(awxAPI`/schedules/:scheduleId/labels/`, async ({ request }) => {
        const body = (await request.json()) as { name: string };
        events.push(`start:${body.name}`);
        await delay(body.name === 'A' ? 50 : 10);
        events.push(`end:${body.name}`);
        return new HttpResponse(null, { status: 204 });
      })
    );
    const { result } = renderHook(() => useProcessLabels());

    await result.current(
      42,
      [
        { id: 0, name: 'A' },
        { id: 0, name: 'B' },
        { id: 0, name: 'C' },
      ],
      makeLaunchConfig(),
      5
    );

    expect(events).toEqual(['start:A', 'end:A', 'start:B', 'end:B', 'start:C', 'end:C']);
  });
});
