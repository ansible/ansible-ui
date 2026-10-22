import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from './api/awx-utils';
import { AwxItemsResponse } from './AwxItemsResponse';
import { Organization } from '../interfaces/Organization';
import {
  canViewNotificationsTab,
  getTemplateNotificationsAccess,
  useNotificationAdminOrganizations,
  useTemplateNotificationsAccess,
} from './useNotificationAdminOrganizations';

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

describe('useTemplateNotificationsAccess', () => {
  it('requests auditor organizations with a non-retrying role-filtered lookup', async () => {
    const requestedQueries: URLSearchParams[] = [];
    server.use(
      http.get(awxAPI`/organizations/`, ({ request }) => {
        requestedQueries.push(new URL(request.url).searchParams);
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );

    const { result } = renderHook(() =>
      useTemplateNotificationsAccess({ is_system_auditor: false }, 7)
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(
      requestedQueries.some(
        (query) => query.get('role_level') === 'auditor_role' && query.get('count_disabled') === '1'
      )
    ).toBe(true);
    expect(result.current).toMatchObject({ canView: false, readOnly: false });
  });

  it('grants read-only access only for an auditor of the template organization', () => {
    const auditors = {
      count: 1,
      results: [{ id: 7, name: 'Audited' }],
      next: null,
      previous: null,
    } as AwxItemsResponse<Organization>;

    expect(
      getTemplateNotificationsAccess({ is_system_auditor: false }, 7, undefined, auditors)
    ).toEqual({
      canView: true,
      readOnly: true,
    });
    expect(
      getTemplateNotificationsAccess({ is_system_auditor: false }, 8, undefined, auditors)
    ).toEqual({
      canView: false,
      readOnly: false,
    });
    expect(
      getTemplateNotificationsAccess({ is_system_auditor: true }, 8, undefined, auditors)
    ).toEqual({
      canView: true,
      readOnly: false,
    });
  });

  it('preserves manager access and fails closed for missing auditor data', () => {
    const managers = {
      count: 1,
      results: [{ id: 9, name: 'Managed' }],
      next: null,
      previous: null,
    } as AwxItemsResponse<Organization>;

    expect(getTemplateNotificationsAccess({ is_system_auditor: false }, 7, managers)).toEqual({
      canView: true,
      readOnly: false,
    });
    expect(getTemplateNotificationsAccess({ is_system_auditor: false }, 7)).toEqual({
      canView: false,
      readOnly: false,
    });
  });
});

describe('canViewNotificationsTab', () => {
  it('returns true for a system auditor', () => {
    expect(canViewNotificationsTab({ is_system_auditor: true })).toBe(true);
  });

  it('returns true when the user can add notification templates in an organization', () => {
    const organizations = {
      count: 1,
      results: [{ id: 1, name: 'Default' }],
      next: null,
      previous: null,
    } as AwxItemsResponse<Organization>;

    expect(canViewNotificationsTab({ is_system_auditor: false }, organizations)).toBe(true);
  });

  it('returns false when the lookup is empty or missing', () => {
    expect(canViewNotificationsTab({ is_system_auditor: false })).toBe(false);
    expect(
      canViewNotificationsTab(undefined, {
        count: 0,
        results: [],
        next: null,
        previous: null,
      })
    ).toBe(false);
  });
});
