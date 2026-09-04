import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { AwxUser } from '../../../interfaces/User';
import { useCanViewNotificationsTab } from './useCanViewNotificationsTab';

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(),
}));

const organization = { id: 1, name: 'Default' };

const activeUser: AwxUser = {
  id: 1,
  username: 'org_auditor_test',
  is_system_auditor: false,
  summary_fields: {
    resource: { ansible_id: '1', resource_type: 'shared.user' },
    organization: { id: 1, name: 'Default', description: '' },
    user_capabilities: { edit: false, delete: false },
  },
  auth: [],
};

let notificationAdminResults: (typeof organization)[] = [];
let auditorResults: (typeof organization)[] = [];
let failingRoleLevels = new Set<string>();
let organizationRequestCount = 0;

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/organizations/'),
    ({ request }) => {
      organizationRequestCount++;
      const roleLevel = new URL(request.url).searchParams.get('role_level');
      if (roleLevel && failingRoleLevels.has(roleLevel)) {
        return HttpResponse.json({ detail: 'Failed to load organizations' }, { status: 500 });
      }
      const results =
        roleLevel === 'notification_admin_role' ? notificationAdminResults : auditorResults;
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }
  )
);

function wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: activeUser });
  notificationAdminResults = [];
  auditorResults = [];
  failingRoleLevels = new Set();
  organizationRequestCount = 0;
});
afterEach(() => {
  vi.mocked(useAwxActiveUser).mockReset();
  server.resetHandlers();
});
afterAll(() => server.close());

describe('useCanViewNotificationsTab', () => {
  it('allows system auditors without loading organization roles', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { ...activeUser, is_system_auditor: true },
    });

    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    expect(result.current.canViewNotificationsTab).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(organizationRequestCount).toBe(0);
  });

  it('allows notification admins to view notification tabs', async () => {
    notificationAdminResults = [organization];

    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    await waitFor(() => expect(result.current.canViewNotificationsTab).toBe(true));
  });

  it('allows organization auditors to view notification tabs', async () => {
    auditorResults = [organization];

    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    await waitFor(() => expect(result.current.canViewNotificationsTab).toBe(true));
  });

  it('does not allow users without notification admin or auditor roles', async () => {
    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.canViewNotificationsTab).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('does not return errors after any role grants notification tab access', async () => {
    notificationAdminResults = [organization];
    failingRoleLevels.add('auditor_role');

    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    await waitFor(() => expect(result.current.canViewNotificationsTab).toBe(true));

    expect(result.current.error).toBeUndefined();
  });

  it('returns errors when notification tab access cannot be determined', async () => {
    failingRoleLevels.add('notification_admin_role');

    const { result } = renderHook(() => useCanViewNotificationsTab(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.canViewNotificationsTab).toBe(false);
    result.current.refresh();
    await waitFor(() => expect(organizationRequestCount).toBeGreaterThan(2));
  });
});
