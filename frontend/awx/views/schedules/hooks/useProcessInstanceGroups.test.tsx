import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';

const postCalls: { url: string; body: unknown }[] = [];

const server = setupServer(
  http.get(awxAPI`/schedules/:id/instance_groups/`, () =>
    HttpResponse.json({
      count: 2,
      results: [
        { id: 1, name: 'controlplane' },
        { id: 2, name: 'default' },
      ],
    })
  ),
  http.post(awxAPI`/schedules/:id/instance_groups/`, async ({ request }) => {
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

describe('useProcessInstanceGroups', () => {
  it('should associate and disassociate instance groups when ask_instance_groups_on_launch is true', async () => {
    const config = makeLaunchConfig({ ask_instance_groups_on_launch: true });

    const { result } = renderHook(() => useProcessInstanceGroups());

    await result.current(
      42,
      [
        { id: 1, name: 'controlplane' },
        { id: 3, name: 'new-group' },
      ] as unknown as InstanceGroup[],
      config
    );

    const disassociateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    const associateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === undefined
    );

    expect(disassociateCalls).toHaveLength(1);
    expect((disassociateCalls[0].body as Record<string, unknown>).id).toBe(2);
    expect(associateCalls).toHaveLength(1);
    expect((associateCalls[0].body as Record<string, unknown>).id).toBe(3);
  });

  it('should disassociate all existing groups when ask_instance_groups_on_launch is false', async () => {
    const config = makeLaunchConfig({ ask_instance_groups_on_launch: false });

    const { result } = renderHook(() => useProcessInstanceGroups());

    await result.current(42, [] as unknown as InstanceGroup[], config);

    const disassociateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    expect(disassociateCalls).toHaveLength(2);
  });

  it('should do nothing when ask is false and no existing groups', async () => {
    server.use(
      http.get(awxAPI`/schedules/:id/instance_groups/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const config = makeLaunchConfig({ ask_instance_groups_on_launch: false });

    const { result } = renderHook(() => useProcessInstanceGroups());

    await result.current(42, [] as unknown as InstanceGroup[], config);

    expect(postCalls).toHaveLength(0);
  });

  it('should handle no changes when current matches desired', async () => {
    server.use(
      http.get(awxAPI`/schedules/:id/instance_groups/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 1, name: 'controlplane' }],
        })
      )
    );

    const config = makeLaunchConfig({ ask_instance_groups_on_launch: true });

    const { result } = renderHook(() => useProcessInstanceGroups());

    await result.current(
      42,
      [{ id: 1, name: 'controlplane' }] as unknown as InstanceGroup[],
      config
    );

    expect(postCalls).toHaveLength(0);
  });

  it('should replace all groups when ask is true and new set provided', async () => {
    const config = makeLaunchConfig({ ask_instance_groups_on_launch: true });

    const { result } = renderHook(() => useProcessInstanceGroups());

    await result.current(42, [{ id: 5, name: 'brand-new' }] as unknown as InstanceGroup[], config);

    const disassociateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    const associateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === undefined
    );

    expect(disassociateCalls).toHaveLength(2);
    expect(associateCalls).toHaveLength(1);
    expect((associateCalls[0].body as Record<string, unknown>).id).toBe(5);
  });
});
