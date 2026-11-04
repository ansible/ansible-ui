import { PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useDeleteAwxRoles } from './useDeleteAwxRoles';
import { useAwxRoleToolbarActions } from './useAwxRoleToolbarActions';

vi.mock('./useDeleteAwxRoles');
vi.mock('../../../common/useAwxActiveUser');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  useGetPageUrl: vi.fn(),
}));

describe('useAwxRoleToolbarActions', () => {
  const deleteRoles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteAwxRoles).mockReturnValue(deleteRoles);
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: { is_superuser: true } } as never);
    vi.mocked(useGetPageUrl).mockReturnValue(() => '/roles/create');
  });

  it('returns create link and delete button actions', () => {
    const { result } = renderHook(() => useAwxRoleToolbarActions(vi.fn()));
    expect(result.current[0]).toMatchObject({ type: PageActionType.Link, label: 'Create role' });
    const deleteAction = result.current[2];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick([]);
    }
    expect(deleteRoles).toHaveBeenCalled();
  });

  it('disables create for non-superusers', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_superuser: false },
    } as never);
    const { result } = renderHook(() => useAwxRoleToolbarActions(vi.fn()));
    const createAction = result.current[0];
    expect(createAction.isDisabled).toMatch(/permission/i);
  });
});
