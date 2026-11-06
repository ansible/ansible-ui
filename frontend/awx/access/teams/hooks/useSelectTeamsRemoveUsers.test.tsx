import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveTeamsFromUsers } from './useRemoveTeamsFromUsers';
import { useSelectTeams } from './useSelectTeams';
import { useSelectTeamsRemoveUsers } from './useSelectTeamsRemoveUsers';

vi.mock('./useSelectTeams');
vi.mock('./useRemoveTeamsFromUsers');

describe('useSelectTeamsRemoveUsers', () => {
  const selectTeams = vi.fn();
  const removeTeamsFromUsers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelectTeams).mockReturnValue(selectTeams);
    vi.mocked(useRemoveTeamsFromUsers).mockReturnValue(removeTeamsFromUsers);
  });

  it('opens team picker then removes users from selected teams', () => {
    const onClose = vi.fn();
    const users = [{ id: 3, username: 'eve' } as AwxUser];
    const teams = [{ id: 4, name: 'Platform' } as Team];

    const { result } = renderHook(() => useSelectTeamsRemoveUsers(onClose));
    result.current(users);

    expect(selectTeams).toHaveBeenCalledWith(
      expect.stringContaining('Remove users from teams'),
      expect.any(Function)
    );
    const onSelect = selectTeams.mock.calls[0]?.[1] as (selectedTeams: Team[]) => void;
    onSelect(teams);
    expect(removeTeamsFromUsers).toHaveBeenCalledWith(users, teams);
  });
});
