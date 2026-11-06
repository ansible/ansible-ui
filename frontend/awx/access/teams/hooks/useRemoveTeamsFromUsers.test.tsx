import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveTeamsFromUsers } from './useRemoveTeamsFromUsers';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useRemoveTeamsFromUsers', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('opens dialog to disassociate users from teams', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRemoveTeamsFromUsers(onComplete));
    const user = { id: 6, username: 'frank' } as AwxUser;
    const team = {
      id: 2,
      name: 'Dev',
      summary_fields: { object_roles: { member_role: { id: 3 } } },
    } as Team;

    result.current([user], [team]);

    expect(mockDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [team],
        onComplete,
      })
    );
    const callArgs = mockDialog.mock.calls[0]?.[0] as {
      actionFn: (selectedTeam: Team, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(team, new AbortController().signal);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/6/roles/'),
      expect.objectContaining({ id: 3, disassociate: true }),
      expect.any(AbortSignal)
    );
  });
});
