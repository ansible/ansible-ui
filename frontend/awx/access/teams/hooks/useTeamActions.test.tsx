import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Team } from '../../../interfaces/Team';
import { useDeleteTeams } from './useDeleteTeams';
import { useSelectAndRemoveUsersFromTeam } from '../../users/hooks/useSelectAndRemoveUsersFromTeam';
import { useSelectUsersAssignTeams } from '../../users/hooks/useSelectUsersAssignTeams';
import { useTeamActions } from './useTeamActions';

vi.mock('./useDeleteTeams');
vi.mock('../../users/hooks/useSelectUsersAssignTeams');
vi.mock('../../users/hooks/useSelectAndRemoveUsersFromTeam');
vi.mock('../../../common/useAwxActiveUser');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

const team = (caps: { edit?: boolean; delete?: boolean }): Team =>
  ({
    id: 1,
    name: 'Dev',
    summary_fields: { user_capabilities: { edit: true, delete: true, ...caps } },
  }) as Team;

describe('useTeamActions', () => {
  const pageNavigate = vi.fn();
  const deleteTeams = vi.fn();
  const assignUsers = vi.fn();
  const removeUsers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(pageNavigate);
    vi.mocked(useDeleteTeams).mockReturnValue(deleteTeams);
    vi.mocked(useSelectUsersAssignTeams).mockReturnValue(assignUsers);
    vi.mocked(useSelectAndRemoveUsersFromTeam).mockReturnValue(removeUsers);
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_superuser: false },
    } as never);
  });

  it('wires row actions to navigate and dialogs', () => {
    const { result } = renderHook(() => useTeamActions({ onTeamsDeleted: vi.fn() }));
    const actions = result.current;
    const editableTeam = team({});

    const editAction = actions[0];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      editAction.onClick(editableTeam);
    }
    expect(pageNavigate).toHaveBeenCalled();

    const assignAction = actions[2];
    if ('onClick' in assignAction && typeof assignAction.onClick === 'function') {
      assignAction.onClick(editableTeam);
    }
    expect(assignUsers).toHaveBeenCalledWith([editableTeam]);

    const removeAction = actions[3];
    if ('onClick' in removeAction && typeof removeAction.onClick === 'function') {
      removeAction.onClick(editableTeam);
    }
    expect(removeUsers).toHaveBeenCalledWith(editableTeam);

    const deleteAction = actions[5];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick(editableTeam);
    }
    expect(deleteTeams).toHaveBeenCalledWith([editableTeam]);
  });

  it('blocks edit when user lacks capability', () => {
    const { result } = renderHook(() => useTeamActions({ onTeamsDeleted: vi.fn() }));
    const editAction = result.current[0];
    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      const disabledReason = (editAction.isDisabled as (t: Team) => string | undefined)(
        team({ edit: false })
      );
      expect(disabledReason).toMatch(/cannot be edited/i);
    }
  });

  it('blocks add and remove users when user lacks edit capability', () => {
    const { result } = renderHook(() => useTeamActions({ onTeamsDeleted: vi.fn() }));
    const restrictedTeam = team({ edit: false });
    const assignAction = result.current[2];
    const removeAction = result.current[3];
    if ('isDisabled' in assignAction && typeof assignAction.isDisabled === 'function') {
      expect((assignAction.isDisabled as (t: Team) => string | undefined)(restrictedTeam)).toMatch(
        /add users/i
      );
    }
    if ('isDisabled' in removeAction && typeof removeAction.isDisabled === 'function') {
      expect((removeAction.isDisabled as (t: Team) => string | undefined)(restrictedTeam)).toMatch(
        /remove users/i
      );
    }
  });
});
