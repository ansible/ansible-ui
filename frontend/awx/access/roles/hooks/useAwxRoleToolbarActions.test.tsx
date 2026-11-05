import { PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useDeleteAwxRoles } from './useDeleteAwxRoles';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { useAwxRoleToolbarActions, useEdaRoleRowActions } from './useAwxRoleToolbarActions';

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

describe('useEdaRoleRowActions', () => {
  const deleteRoles = vi.fn();
  const getPageUrl = vi.fn(() => '/roles/5/edit');
  const role = (overrides: Partial<AwxRbacRole>): AwxRbacRole =>
    ({ id: 5, name: 'Custom', managed: false, ...overrides }) as AwxRbacRole;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteAwxRoles).mockReturnValue(deleteRoles);
    vi.mocked(useGetPageUrl).mockReturnValue(getPageUrl);
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: { is_superuser: true } } as never);
  });

  it('builds edit link and delete handler for custom roles', () => {
    const { result } = renderHook(() => useEdaRoleRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('href' in editAction && typeof editAction.href === 'function') {
      expect(editAction.href(role({ id: 5 }))).toBe('/roles/5/edit');
    }
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      deleteAction.onClick(role({ id: 5 }));
    }
    expect(deleteRoles).toHaveBeenCalledWith([role({ id: 5 })]);
  });

  it('disables edit and delete for managed roles', () => {
    const { result } = renderHook(() => useEdaRoleRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      expect(
        (editAction.isDisabled as (r: AwxRbacRole) => string | undefined)(role({ managed: true }))
      ).toMatch(/built-in/i);
    }
    if ('isDisabled' in deleteAction && typeof deleteAction.isDisabled === 'function') {
      expect(
        (deleteAction.isDisabled as (r: AwxRbacRole) => string | undefined)(role({ managed: true }))
      ).toMatch(/built-in/i);
    }
  });

  it('disables edit and delete for non-superusers', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_superuser: false },
    } as never);
    const { result } = renderHook(() => useEdaRoleRowActions(vi.fn()));
    const editAction = result.current[0];
    const deleteAction = result.current[2];
    if ('isDisabled' in editAction && typeof editAction.isDisabled === 'function') {
      expect((editAction.isDisabled as (r: AwxRbacRole) => string | undefined)(role({}))).toMatch(
        /permission/i
      );
    }
    if ('isDisabled' in deleteAction && typeof deleteAction.isDisabled === 'function') {
      expect((deleteAction.isDisabled as (r: AwxRbacRole) => string | undefined)(role({}))).toMatch(
        /permission/i
      );
    }
  });
});
