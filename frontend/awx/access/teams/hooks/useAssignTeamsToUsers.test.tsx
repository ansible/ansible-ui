import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useAssignTeamsToUsers } from './useAssignTeamsToUsers';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useAssignTeamsToUsers', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('assigns users to each selected team', async () => {
    const { result } = renderHook(() => useAssignTeamsToUsers());
    const team = {
      id: 1,
      name: 'Ops',
      summary_fields: { object_roles: { member_role: { id: 8 } } },
    } as Team;
    const user = { id: 2, username: 'bob' } as AwxUser;

    result.current([team], [user]);

    const callArgs = mockDialog.mock.calls[0]?.[0] as {
      actionFn: (t: Team, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(team, new AbortController().signal);
    expect(mockPost).toHaveBeenCalled();
  });
});
