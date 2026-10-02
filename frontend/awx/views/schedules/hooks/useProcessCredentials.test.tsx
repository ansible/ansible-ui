import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { Credential } from '../../../interfaces/Credential';
import { useProcessCredentials } from './useProcessCredentials';

const postCalls: { url: string; body: unknown }[] = [];

const server = setupServer(
  http.get(awxAPI`/schedules/:id/credentials/`, () =>
    HttpResponse.json({
      count: 2,
      results: [
        { id: 1, name: 'Existing Cred 1', credential_type: 1 },
        { id: 2, name: 'Existing Cred 2', credential_type: 2 },
      ],
    })
  ),
  http.post(awxAPI`/schedules/:id/credentials/`, async ({ request }) => {
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
      credentials: [{ id: 10, name: 'Default Cred', credential_type: 1, passwords_needed: [] }],
      execution_environment: {},
      forks: 0,
      job_slice_count: 1,
      timeout: 0,
      instance_groups: [],
    },
    ...overrides,
  } as LaunchConfiguration;
}

describe('useProcessCredentials', () => {
  it('should associate new credentials and disassociate removed ones', async () => {
    const config = makeLaunchConfig();

    const { result } = renderHook(() => useProcessCredentials());

    await result.current(
      42,
      [
        { id: 1, name: 'Existing Cred 1', credential_type: 1 },
        { id: 3, name: 'New Cred', credential_type: 3 },
      ] as unknown as Credential[],
      config
    );

    const disassociateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    const associateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === undefined
    );

    expect(disassociateCalls.length).toBeGreaterThan(0);
    expect(associateCalls.some((c) => (c.body as Record<string, unknown>).id === 3)).toBe(true);
  });

  it('should disassociate all when credentials list is empty', async () => {
    const config = makeLaunchConfig();

    const { result } = renderHook(() => useProcessCredentials());

    await result.current(42, [] as unknown as Credential[], config);

    const disassociateCalls = postCalls.filter(
      (c) => (c.body as Record<string, unknown>).disassociate === true
    );
    expect(disassociateCalls.length).toBeGreaterThan(0);
  });

  it('should handle null launch_config credentials gracefully', async () => {
    const config = makeLaunchConfig({
      defaults: {
        ...makeLaunchConfig().defaults,
        credentials: [],
      },
    } as Partial<LaunchConfiguration>);

    const { result } = renderHook(() => useProcessCredentials());

    await result.current(
      42,
      [{ id: 5, name: 'Brand New', credential_type: 1 }] as unknown as Credential[],
      config
    );

    const associateCalls = postCalls.filter((c) => (c.body as Record<string, unknown>).id === 5);
    expect(associateCalls).toHaveLength(1);
  });

  it('should do nothing when no changes needed', async () => {
    server.use(
      http.get(awxAPI`/schedules/:id/credentials/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 1, name: 'Cred 1', credential_type: 1 }],
        })
      )
    );

    const config = makeLaunchConfig({
      defaults: {
        ...makeLaunchConfig().defaults,
        credentials: [],
      },
    } as Partial<LaunchConfiguration>);

    const { result } = renderHook(() => useProcessCredentials());

    await result.current(
      42,
      [{ id: 1, name: 'Cred 1', credential_type: 1 }] as unknown as Credential[],
      config
    );

    expect(postCalls).toHaveLength(0);
  });
});
