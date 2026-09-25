import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkConfirmation } from '../../common/useAwxBulkConfirmation';
import { useRemoveUsersFromResource } from './useRemoveUserFromResource';
import { AwxUser } from '../../interfaces/User';
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
});
