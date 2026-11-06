import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const { mockBulkConfirmation, mockRequestDelete } = vi.hoisted(() => ({
  mockBulkConfirmation: vi.fn(),
  mockRequestDelete: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      return key.replace(/\{\{(\w+)\}\}/g, (_m, name: string) =>
        String(options[name] ?? `{{${name}}}`)
      );
    },
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});

vi.mock('./useUserColumns', () => ({
  useUsersColumns: () => [{ id: 'name', header: 'Name', cell: () => null }],
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    requestDelete: (
      ...args: Parameters<typeof actual.requestDelete>
    ): ReturnType<typeof actual.requestDelete> =>
      mockRequestDelete(...args) as ReturnType<typeof actual.requestDelete>,
  };
});

import { useDeleteUsers } from './useDeleteUsers';

const mockUser = (overrides: Partial<PlatformUser> = {}): PlatformUser => ({
  id: 1,
  url: '/u/1',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'a', resource_type: 'user' },
  },
  username: 'alice',
  last_login_map_results: [],
  managed: false,
  ...overrides,
});

describe('useDeleteUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('invokes bulk confirmation with sorted users and deletes via API', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete));

    const userB = mockUser({ id: 2, username: 'bob' });
    const userA = mockUser({ id: 1, username: 'alice' });

    result.current([userB, userA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: PlatformUser[];
      actionFn: (user: PlatformUser, signal: AbortSignal) => unknown;
      onComplete: (users: PlatformUser[]) => void;
      isItemNonActionable: (user: PlatformUser) => string;
    };

    expect(callArg.items.map((u) => u.username)).toEqual(['alice', 'bob']);
    expect(callArg.isItemNonActionable(userA)).toBe('');

    const signal = new AbortController().signal;
    callArg.actionFn(userA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith(gatewayAPI`/users/1/`, signal);

    const users: PlatformUser[] = [userA];
    callArg.onComplete(users);
    expect(onComplete).toHaveBeenCalledWith(users);
  });

  test('treats managed users as non-actionable and surfaces alert', () => {
    const { result } = renderHook(() => useDeleteUsers(vi.fn()));
    const managed = mockUser({ username: 'svc', managed: true });

    result.current([managed]);

    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      alertPrompts: string[] | undefined;
      isItemNonActionable: (user: PlatformUser) => string;
    };

    expect(callArg.alertPrompts?.length).toBeGreaterThan(0);
    expect(callArg.isItemNonActionable(managed)).toBe('System managed users cannot be deleted');
  });
});
