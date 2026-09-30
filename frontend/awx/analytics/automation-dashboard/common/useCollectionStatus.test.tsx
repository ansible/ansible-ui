import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { metricsAPI } from '../../../common/api/metrics-utils';
import type { IAutomationDashboardCollectionStatus } from '../types';
import { useCollectionStatus } from './useCollectionStatus';

const collectionStatusUrl = metricsAPI`/dashboard_reports/collection_status/`;

const collectionStatus: IAutomationDashboardCollectionStatus = {
  enabled: true,
  last_sync: '2026-09-21T07:08:09.000Z',
  show_dashboard: true,
  show_leaderboard: true,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCollectionStatus', () => {
  test('should start in a loading state without data', () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    const { result } = renderHook(() => useCollectionStatus(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  test('should return the collection_status response once loaded', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    const { result } = renderHook(() => useCollectionStatus(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(collectionStatus);
    expect(result.current.error).toBeUndefined();
  });

  test('should return an error when collection_status fails', async () => {
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json({ detail: 'boom' }, { status: 500 }))
    );

    const { result } = renderHook(() => useCollectionStatus(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  test('should keep the same result object between renders when nothing changed', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    const { result, rerender } = renderHook(() => useCollectionStatus(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
