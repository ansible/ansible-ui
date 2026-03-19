import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SWRConfig } from 'swr';
import { useRuntimeFeatureFlags } from './useRuntimeFeatureFlags';
import { IFeatureFlag } from './IFeatureFlag';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
  );
}

function createFlag(overrides: Partial<IFeatureFlag> = {}): IFeatureFlag {
  return {
    id: 1,
    url: '/api/gateway/v1/feature_flags/1/',
    related: {
      activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=1',
      created_by: '/api/gateway/v1/users/1/',
      modified_by: '/api/gateway/v1/users/1/',
    },
    summary_fields: {
      modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      resource: { ansible_id: 'test-id', resource_type: 'shared.aapflag' },
    },
    created: '2026-03-09T09:10:01.782315Z',
    created_by: 1,
    modified: '2026-03-09T09:10:01.782295Z',
    modified_by: 1,
    name: 'FEATURE_TEST',
    ui_name: 'Test Feature',
    condition: 'boolean',
    value: 'False',
    required: false,
    support_level: 'TECHNOLOGY_PREVIEW',
    visibility: true,
    toggle_type: 'run-time',
    description: 'A test feature flag.',
    support_url: 'https://access.redhat.com/articles/test',
    labels: ['controller'],
    state: false,
    ...overrides,
  };
}

function mockFeatureFlagsAPI(flags: IFeatureFlag[]) {
  server.use(
    http.get('/api/gateway/v1/feature_flags/', () =>
      HttpResponse.json({
        count: flags.length,
        next: null,
        previous: null,
        results: flags,
      })
    )
  );
}

describe('useRuntimeFeatureFlags', () => {
  it('should fetch and return visible flags', async () => {
    const flags = [
      createFlag({ id: 1, ui_name: 'Flag A', visibility: true, state: true }),
      createFlag({ id: 2, ui_name: 'Flag B', visibility: true, state: false }),
    ];
    mockFeatureFlagsAPI(flags);

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.flags).toHaveLength(2);
    expect(result.current.error).toBeUndefined();
  });

  it('should display private flags in read-only state', async () => {
    const flags = [
      createFlag({ id: 1, ui_name: 'Visible Flag', visibility: true, state: true }),
      createFlag({ id: 2, ui_name: 'Private Disabled Flag', visibility: false, state: false }),
    ];
    mockFeatureFlagsAPI(flags);

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.flags).toHaveLength(2);
    expect(result.current.flags[1].ui_name).toBe('Private Disabled Flag');
  });

  it('should include flags with visibility=false and state=true', async () => {
    const flags = [
      createFlag({ id: 1, ui_name: 'Private Enabled', visibility: false, state: true }),
    ];
    mockFeatureFlagsAPI(flags);

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.flags).toHaveLength(1);
    expect(result.current.flags[0].ui_name).toBe('Private Enabled');
  });

  it('should include flags with visibility=true and state=false', async () => {
    const flags = [
      createFlag({ id: 1, ui_name: 'Public Disabled', visibility: true, state: false }),
    ];
    mockFeatureFlagsAPI(flags);

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.flags).toHaveLength(1);
    expect(result.current.flags[0].ui_name).toBe('Public Disabled');
  });

  it('should return error on API failure', async () => {
    server.use(http.get('/api/gateway/v1/feature_flags/', () => HttpResponse.error()));

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.flags).toEqual([]);
  });

  it('should return empty flags while loading', () => {
    server.use(
      http.get(
        '/api/gateway/v1/feature_flags/',
        () =>
          // Delay response to keep in loading state
          new Promise(() => {})
      )
    );

    const { result } = renderHook(() => useRuntimeFeatureFlags(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.flags).toEqual([]);
  });
});
