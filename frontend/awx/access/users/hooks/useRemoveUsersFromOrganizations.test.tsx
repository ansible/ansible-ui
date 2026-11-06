import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveUsersFromOrganizations } from './useRemoveUsersFromOrganizations';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useRemoveUsersFromOrganizations', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('opens dialog to disassociate users from organizations', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRemoveUsersFromOrganizations(onComplete));
    const user = { id: 1, username: 'alice' } as AwxUser;
    const org = {
      summary_fields: { object_roles: { member_role: { id: 9 } } },
    } as Organization;

    result.current([user], [org]);

    expect(mockDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [user],
        onComplete,
      })
    );
    const callArgs = mockDialog.mock.calls[0]?.[0] as {
      actionFn: (u: AwxUser, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(user, new AbortController().signal);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/1/roles/'),
      expect.objectContaining({ disassociate: true }),
      expect.any(AbortSignal)
    );
  });
});
