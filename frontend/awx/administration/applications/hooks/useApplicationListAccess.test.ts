import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  resetTestSwrCache,
  SwrTestWrapper,
} from '../../../../../framework/test-utils/swrTestWrapper';
import { awxAPI } from '../../../common/api/awx-utils';
import { useApplicationListAccess } from './useApplicationListAccess';

const applicationsUrl = awxAPI`/applications/`;

const server = setupServer(
  http.get(applicationsUrl, () => HttpResponse.json({ count: 0, results: [] }))
);

describe('useApplicationListAccess', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
    resetTestSwrCache();
  });

  afterEach(() => {
    resetTestSwrCache();
  });

  it('should report canList true when the probe succeeds', async () => {
    const { result } = renderHook(() => useApplicationListAccess(applicationsUrl), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.canList).toBe(true);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should report canList false when the probe returns 403', async () => {
    server.use(http.get(applicationsUrl, () => new HttpResponse(null, { status: 403 })));

    const { result } = renderHook(() => useApplicationListAccess(applicationsUrl), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.canList).toBe(false);
    });
  });

  it('should leave canList undefined when the probe returns a non-list payload', async () => {
    server.use(http.get(applicationsUrl, () => HttpResponse.json({ unexpected: true })));

    const { result } = renderHook(() => useApplicationListAccess(applicationsUrl), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.canList).toBeUndefined();
  });

  it('should leave canList undefined for non-forbidden errors', async () => {
    server.use(http.get(applicationsUrl, () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useApplicationListAccess(applicationsUrl), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.canList).toBeUndefined();
  });
});
