import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { useDeleteAwxRoles } from './useDeleteAwxRoles';
import { useAwxRoleRowActions } from './useAwxRoleRowActions';

vi.mock('./useDeleteAwxRoles');
vi.mock('../../../common/useAwxActiveUser');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  useGetPageUrl: vi.fn(),
}));

const role = (overrides: Partial<AwxRbacRole>): AwxRbacRole =>
  ({ id: 1, name: 'Editor', managed: false, ...overrides }) as AwxRbacRole;

describe('useAwxRoleRowActions', () => {
  const deleteRoles = vi.fn();
  const getPageUrl = vi.fn(() => '/roles/1/edit');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteAwxRoles).mockReturnValue(deleteRoles);
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: { is_superuser: true } } as never);
    vi.mocked(useGetPageUrl).mockReturnValue(getPageUrl);
  });

  it('builds edit href and delete handler', () => {
    const { result } = renderHook(() => useAwxRoleRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('href' in editAction && typeof editAction.href === 'function') {
      expect(editAction.href(role({ id: 9 }))).toBe('/roles/1/edit');
    }
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick(role({}));
    }
    expect(deleteRoles).toHaveBeenCalledWith([role({})]);
  });

  it('disables edit for managed roles', () => {
    const { result } = renderHook(() => useAwxRoleRowActions(vi.fn()));
    const editAction = result.current[0];
    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      const disabledReason = (editAction.isDisabled as (r: AwxRbacRole) => string | undefined)(
        role({ managed: true })
      );
      expect(disabledReason).toMatch(/built-in/i);
    }
  });
});
