import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AwxUser } from '../../../interfaces/User';
import { useAddUsersToResources } from './useAddUsersToResources';
import { useSelectUsers } from './useSelectUsers';

vi.mock('./useSelectUsers');
vi.mock('./useAddUsersToResources');

describe('useSelectUsersAssignTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects users then adds them to teams', async () => {
    const selectUsers = vi.fn();
    const addUsersToResources = vi.fn();
    vi.mocked(useSelectUsers).mockReturnValue(selectUsers);
    vi.mocked(useAddUsersToResources).mockReturnValue(addUsersToResources);

    const { useSelectUsersAssignTeams } = await import('./useSelectUsersAssignTeams');
    const onClose = vi.fn();
    const { result } = renderHook(() => useSelectUsersAssignTeams(onClose));
    const team = {
      id: 5,
      summary_fields: { object_roles: { member_role: { id: 99 } } },
    };

    result.current([team]);

    expect(selectUsers).toHaveBeenCalled();
    const selectCallback = selectUsers.mock.calls[0]?.[1] as (users: AwxUser[]) => void;
    const users = [{ id: 1, username: 'alice' } as AwxUser];
    selectCallback(users);
    expect(addUsersToResources).toHaveBeenCalledWith(users, [team], onClose);
  });
});
