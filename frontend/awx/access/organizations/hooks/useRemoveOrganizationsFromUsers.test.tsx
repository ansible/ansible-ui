import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveOrganizationsFromUsers } from './useRemoveOrganizationsFromUsers';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useRemoveOrganizationsFromUsers', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('opens dialog to disassociate users from organizations', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRemoveOrganizationsFromUsers());
    const user = { id: 2, username: 'dave' } as AwxUser;
    const org = {
      id: 3,
      name: 'Ops',
      summary_fields: { object_roles: { member_role: { id: 7 } } },
    } as Organization;

    result.current([user], [org], onComplete);

    expect(mockDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [org],
        onComplete,
      })
    );
    const callArgs = mockDialog.mock.calls[0]?.[0] as {
      actionFn: (organization: Organization, signal: AbortSignal) => Promise<void>;
    };
    await callArgs.actionFn(org, new AbortController().signal);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/2/roles/'),
      expect.objectContaining({ id: 7, disassociate: true }),
      expect.any(AbortSignal)
    );
  });
});
