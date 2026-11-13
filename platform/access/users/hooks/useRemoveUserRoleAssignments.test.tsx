import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

const mocks = vi.hoisted(() => ({
  bulkConfirmation: vi.fn(),
  onComplete: vi.fn(),
  userRolesColumns: vi.fn(() => [{ id: 'role', header: 'Role' }]),
  requestDelete: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mocks.bulkConfirmation,
  };
});

vi.mock('./usePlatformUserRolesColumns', () => ({
  usePlatformUserRolesColumns: () => mocks.userRolesColumns(),
}));

vi.mock('@ansible/common-ui/crud/Data', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/Data')>(
    '@ansible/common-ui/crud/Data'
  );
  return {
    ...actual,
    requestDelete: mocks.requestDelete,
  };
});

import { useRemoveUserRoleAssignments } from './useRemoveUserRoleAssignments';

const assignment = (roleName: string, id: number): UserAssignment => ({
  id,
  user: 1,
  object_id: '42',
  content_type: 'awx.project',
  role_definition: 10,
  summary_fields: {
    object_role: { id: 1 },
    role_definition: { id: 10, name: roleName, description: '', managed: false },
    content_object: { id: 1, name: 'obj' },
    user: {
      id: 1,
      username: 'u',
      email: 'u@example.com',
      first_name: 'U',
      last_name: 'Ser',
    },
  },
});

describe('useRemoveUserRoleAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('passes sorted assignments and deletes by assignment id', async () => {
    const { result } = renderHook(() => useRemoveUserRoleAssignments(mocks.onComplete));

    result.current([assignment('Beta', 2), assignment('Alpha', 3)]);

    const arg = mocks.bulkConfirmation.mock.calls[0][0] as {
      items: UserAssignment[];
      actionFn: (item: UserAssignment, signal: AbortSignal) => Promise<unknown>;
      title: string;
    };

    expect(arg.title).toBe('Remove role:2');
    expect(arg.items.map((item) => item.summary_fields.role_definition.name)).toEqual([
      'Alpha',
      'Beta',
    ]);
    expect(mocks.userRolesColumns).toHaveBeenCalled();

    const signal = new AbortController().signal;
    await arg.actionFn(assignment('Alpha', 3), signal);

    expect(mocks.requestDelete).toHaveBeenCalledWith(gatewayAPI`/role_user_assignments/3/`, signal);
  });
});
