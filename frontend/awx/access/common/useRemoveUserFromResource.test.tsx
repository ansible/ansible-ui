import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkConfirmation } from '../../common/useAwxBulkConfirmation';
import { AwxUser } from '../../interfaces/User';
import { useRemoveUsersFromResource } from './useRemoveUserFromResource';
import { ResourceType } from './types';

vi.mock('../../common/useAwxBulkConfirmation');
vi.mock('../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(() => ({ activeAwxUser: { is_superuser: true } })),
}));
vi.mock('../users/hooks/useUsersColumns', () => ({
  useUsersColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn()),
}));

describe('useRemoveUsersFromResource', () => {
  const mockConfirmation = vi.fn();
  const mockPost = vi.fn();
  const user = { id: 1, username: 'user' } as AwxUser;
  const resource = {
    type: 'organization',
    summary_fields: {
      object_roles: { member_role: { id: 1 } },
      user_capabilities: { edit: true },
    },
  } satisfies ResourceType;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockConfirmation);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('uses the resource-specific title for an organization', () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());

    result.current([user], resource);

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Remove user from organization' })
    );
  });

  it('uses the generic title for an unknown resource type', () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());

    result.current([user], { ...resource, type: 'unknown' });

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Remove user' })
    );
  });

  it('uses the generic title when the resource has no type', () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());

    result.current([user], { ...resource, type: undefined });

    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Remove user' })
    );
  });

  it('uses team-specific title', () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());
    result.current([user], { ...resource, type: 'team' });
    expect(mockConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Remove user from team' })
    );
  });

  it('blocks removal of superusers and system auditors', () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());
    result.current(
      [
        { ...user, is_superuser: true },
        { ...user, id: 2, is_system_auditor: true },
      ],
      resource
    );
    const callArgs = mockConfirmation.mock.calls[0]?.[0] as {
      isItemNonActionable: (u: AwxUser) => string | undefined;
    };
    expect(callArgs.isItemNonActionable({ ...user, is_superuser: true })).toMatch(
      /administrators/i
    );
    expect(callArgs.isItemNonActionable({ ...user, is_system_auditor: true })).toMatch(/auditors/i);
  });

  it('disassociates user roles in actionFn', async () => {
    const { result } = renderHook(() => useRemoveUsersFromResource());
    result.current([{ ...user, user_roles: [{ id: 9 }] } as AwxUser], resource);
    const callArgs = mockConfirmation.mock.calls[0]?.[0] as {
      actionFn: (u: AwxUser, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(
      { ...user, user_roles: [{ id: 9 }] } as AwxUser,
      new AbortController().signal
    );
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/1/roles/'),
      expect.objectContaining({ disassociate: true }),
      expect.any(AbortSignal)
    );
  });
});
