import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useAddOrganizationsToUsers } from './useAddOrganizationsToUsers';

vi.mock('../../../common/useAwxBulkActionDialog');
vi.mock('@ansible/common-ui/crud/usePostRequest');

describe('useAddOrganizationsToUsers', () => {
  const mockDialog = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkActionDialog).mockReturnValue(mockDialog);
    vi.mocked(usePostRequest).mockReturnValue(mockPost);
  });

  it('opens dialog to associate users with organizations', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useAddOrganizationsToUsers());
    const user = { id: 4, username: 'carol' } as AwxUser;
    const org = {
      id: 1,
      name: 'Default',
      summary_fields: { object_roles: { member_role: { id: 11 } } },
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
      expect.stringContaining('/users/4/roles/'),
      expect.objectContaining({ id: 11 }),
      expect.any(AbortSignal)
    );
  });
});
