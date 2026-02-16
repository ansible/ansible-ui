import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from './api/awx-utils';
import { useFeatureFlag, useFeatureFlags } from './useFeatureFlags';

const server = setupServer(
  http.get(awxAPI`/feature_flags_state/`, () => HttpResponse.json({ TEST_FEATURE_ENABLED: true }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useFeatureFlags', () => {
  it('returns feature flags from API', async () => {
    const { result } = renderHook(() => useFeatureFlags());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    expect(result.current.data?.TEST_FEATURE_ENABLED).toBe(true);
  });
});

describe('useFeatureFlag', () => {
  it('returns flag value for TEST_FEATURE_ENABLED', async () => {
    const { result } = renderHook(() => useFeatureFlag('TEST_FEATURE_ENABLED'));
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
