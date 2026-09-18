import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from './api/awx-utils';
import { useNotificationAdminOrganizations } from './useNotificationAdminOrganizations';

const server = setupServer(
  http.get(awxAPI`/organizations/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useNotificationAdminOrganizations', () => {
  it('returns organizations when the lookup succeeds', async () => {
    const { result } = renderHook(() => useNotificationAdminOrganizations());

    await waitFor(() => {
      expect(result.current.isLoadingNotificationAdminOrganizations).toBe(false);
    });

    expect(result.current.notificationAdminOrganizations).toEqual({
      count: 0,
      results: [],
      next: null,
      previous: null,
    });
  });

  it('returns no organizations when the lookup fails', async () => {
    server.use(http.get(awxAPI`/organizations/`, () => HttpResponse.json({}, { status: 500 })));

    const { result } = renderHook(() => useNotificationAdminOrganizations());

    await waitFor(() => {
      expect(result.current.isLoadingNotificationAdminOrganizations).toBe(false);
    });

    expect(result.current.notificationAdminOrganizations).toBeUndefined();
  });
});
