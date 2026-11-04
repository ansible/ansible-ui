import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AwxUser } from '../../../interfaces/User';
import { useAddUsersToResources } from './useAddUsersToResources';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useAddUsersToResources', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('opens progress dialog to assign member roles', async () => {
    const { result } = renderHook(() => useAddUsersToResources());
    const user = { id: 3, username: 'bob' } as AwxUser;
    const resource = {
      summary_fields: { object_roles: { member_role: { id: 42 } } },
    };

    result.current([user], [resource]);

    expect(mockDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [user],
      })
    );
    const callArgs = mockDialog.mock.calls[0]?.[0] as {
      actionFn: (u: AwxUser, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(user, new AbortController().signal);
    expect(mockPost).toHaveBeenCalled();
  });
});
