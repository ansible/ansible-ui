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
  shouldFetchAuditorOrganizations,
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

describe('shouldFetchAuditorOrganizations', () => {
  it('returns false for system auditors and notification managers', () => {
    const managers = {
      count: 1,
      results: [{ id: 1, name: 'Managed' }],
      next: null,
      previous: null,
    } as AwxItemsResponse<Organization>;

    expect(shouldFetchAuditorOrganizations({ is_system_auditor: true }, managers, false)).toBe(
      false
    );
    expect(shouldFetchAuditorOrganizations({ is_system_auditor: false }, managers, false)).toBe(
      false
    );
    expect(shouldFetchAuditorOrganizations({ is_system_auditor: false }, undefined, true)).toBe(
      false
    );
    expect(shouldFetchAuditorOrganizations(undefined, managers, false)).toBe(false);
  });

  it('returns true when manager access is unknown or denied', () => {
    expect(shouldFetchAuditorOrganizations(undefined, undefined, false)).toBe(true);
    expect(shouldFetchAuditorOrganizations({ is_system_auditor: false }, undefined, false)).toBe(
      true
    );
    expect(
      shouldFetchAuditorOrganizations(
        { is_system_auditor: false },
        { count: 0, results: [], next: null, previous: null },
        false
      )
    ).toBe(true);
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

  it('skips auditor organizations lookup for system auditors', async () => {
    const requestedRoleLevels: string[] = [];
    server.use(
      http.get(awxAPI`/organizations/`, ({ request }) => {
        requestedRoleLevels.push(new URL(request.url).searchParams.get('role_level') ?? '');
        return HttpResponse.json({ count: 0, results: [], next: null, previous: null });
      })
    );

    const { result } = renderHook(() =>
      useTemplateNotificationsAccess({ is_system_auditor: true }, 7)
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedRoleLevels).not.toContain('auditor_role');
    expect(result.current).toMatchObject({ canView: true, readOnly: false });
  });

  it('skips auditor organizations lookup for notification template managers', async () => {
    const requestedRoleLevels: string[] = [];
    server.use(
      http.get(awxAPI`/organizations/`, ({ request }) => {
        const roleLevel = new URL(request.url).searchParams.get('role_level') ?? '';
        requestedRoleLevels.push(roleLevel);
        return HttpResponse.json({
          count: roleLevel === 'add_notificationtemplate' ? 1 : 0,
          results: roleLevel === 'add_notificationtemplate' ? [{ id: 9, name: 'Managed' }] : [],
          next: null,
          previous: null,
        });
      })
    );

    const { result } = renderHook(() =>
      useTemplateNotificationsAccess({ is_system_auditor: false }, 7)
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(requestedRoleLevels).not.toContain('auditor_role');
    expect(result.current).toMatchObject({ canView: true, readOnly: false });
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
