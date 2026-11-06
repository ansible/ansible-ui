import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformRole } from '../../../interfaces/PlatformRole';
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

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({ activePlatformUser: { is_superuser: true, id: 1 } }),
}));

vi.mock('./usePlatformRoleColumns', () => ({
  usePlatformRoleColumns: () => [{ id: 'name', header: 'Name', cell: () => null }],
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

import { useDeletePlatformRoles } from './useDeletePlatformRoles';

const mockRole = (overrides: Partial<PlatformRole> = {}): PlatformRole => ({
  id: 10,
  url: '/r/10',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  permissions: [],
  content_type: null,
  created: '',
  modified: '',
  name: 'Custom Role',
  description: '',
  managed: false,
  created_by: null,
  modified_by: null,
  ...overrides,
});

describe('useDeletePlatformRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('invokes bulk confirmation with sorted roles and deletes via API', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeletePlatformRoles(onComplete));

    const roleB = mockRole({ id: 2, name: 'b-role' });
    const roleA = mockRole({ id: 1, name: 'a-role' });

    result.current([roleB, roleA]);

    expect(mockBulkConfirmation).toHaveBeenCalledTimes(1);
    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      items: PlatformRole[];
      actionFn: (role: PlatformRole, signal: AbortSignal) => unknown;
      onComplete: (roles: PlatformRole[]) => void;
      isItemNonActionable: (role: PlatformRole) => string;
    };

    expect(callArg.items.map((r) => r.name)).toEqual(['a-role', 'b-role']);
    expect(callArg.isItemNonActionable(roleA)).toBe('');

    const signal = new AbortController().signal;
    callArg.actionFn(roleA, signal);
    expect(mockRequestDelete).toHaveBeenCalledWith(gatewayAPI`/role_definitions/1/`, signal);

    const roles: PlatformRole[] = [roleA];
    callArg.onComplete(roles);
    expect(onComplete).toHaveBeenCalledWith(roles);
  });

  test('marks built-in roles non-actionable and includes alert prompt', () => {
    const { result } = renderHook(() => useDeletePlatformRoles(vi.fn()));
    const builtIn = mockRole({ id: 5, name: 'AWX Admin', managed: true });

    result.current([builtIn]);

    const callArg = mockBulkConfirmation.mock.calls[0][0] as {
      alertPrompts: string[] | undefined;
      isItemNonActionable: (role: PlatformRole) => string;
    };

    expect(callArg.alertPrompts?.length).toBeGreaterThan(0);
    expect(callArg.isItemNonActionable(builtIn)).toBe('Built-in roles cannot be deleted.');
  });
});
