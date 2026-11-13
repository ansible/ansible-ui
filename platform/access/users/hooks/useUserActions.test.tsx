import { renderHook } from '@testing-library/react';
import {
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  IPageActionLink,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { IPlatformView } from '../../../hooks/usePlatformView';

const mockPageNavigate = vi.fn();
const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);
const mockDeleteUsers = vi.fn();
const mockUseOptionsReturn = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (...args: unknown[]) => mockUseOptionsReturn(...args) as unknown,
}));

vi.mock('./useDeleteUsers', () => ({
  useDeleteUsers: () => mockDeleteUsers,
}));

import { useUserRowActions, useUserToolbarActions } from './useUserActions';

function isCreateLink(
  action: ReturnType<typeof useUserToolbarActions>[number]
): action is IPageActionLink {
  return action.type === PageActionType.Link && action.selection === PageActionSelection.None;
}

function isMultiDelete(
  action: ReturnType<typeof useUserToolbarActions>[number]
): action is IPageActionButtonMultiple<PlatformUser> {
  return (
    action.type === PageActionType.Button &&
    action.selection === PageActionSelection.Multiple &&
    action.label === 'Delete users'
  );
}

function findSingleButton(
  actions: ReturnType<typeof useUserRowActions>,
  label: string
): IPageActionButtonSingle<PlatformUser> | undefined {
  return actions.find(
    (a): a is IPageActionButtonSingle<PlatformUser> =>
      a.type === PageActionType.Button &&
      a.selection === PageActionSelection.Single &&
      a.label === label
  );
}

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
} as unknown as IPlatformView<PlatformUser>;

const mockUser: PlatformUser = {
  id: 7,
  url: '/api/gateway/v1/users/7/',
  created: '',
  created_by: '',
  modified: '',
  modified_by: '',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'u', resource_type: 'shared.user' },
  },
  username: 'alice',
  last_login_map_results: [],
  managed: false,
};

describe('useUserActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({ data: { actions: { POST: true } } });
  });

  test('toolbar exposes create and bulk delete actions when POST is allowed', () => {
    const { result } = renderHook(() => useUserToolbarActions(mockView));

    const create = result.current.find(isCreateLink);
    expect(create?.href).toBe(`/mock/${PlatformRoute.CreateUser}`);
    expect(create?.isDisabled).toBeUndefined();

    const bulkDelete = result.current.find(isMultiDelete);
    expect(bulkDelete).toBeDefined();
    bulkDelete?.onClick?.([mockUser]);
    expect(mockDeleteUsers).toHaveBeenCalledWith([mockUser]);
  });

  test('toolbar disables create when POST is not allowed', () => {
    mockUseOptionsReturn.mockReturnValue({ data: { actions: { GET: true } } });
    const { result } = renderHook(() => useUserToolbarActions(mockView));
    const create = result.current.find(isCreateLink);
    expect(create?.isDisabled).toMatch(/permission to create a user/i);
  });

  test('row actions navigate to edit and block managed users', () => {
    const { result } = renderHook(() => useUserRowActions(vi.fn()));

    const edit = findSingleButton(result.current, 'Edit user');
    const del = findSingleButton(result.current, 'Delete user');

    edit?.onClick?.(mockUser);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditUser, { params: { id: 7 } });

    const managed = { ...mockUser, managed: true };
    if (edit && 'isDisabled' in edit && typeof edit.isDisabled === 'function') {
      expect(edit.isDisabled(managed)).toBe('System managed users cannot be edited');
    } else {
      throw new Error('expected edit action with isDisabled');
    }
    if (del && 'isDisabled' in del && typeof del.isDisabled === 'function') {
      expect(del.isDisabled(managed)).toBe('System managed users cannot be deleted');
    } else {
      throw new Error('expected delete action with isDisabled');
    }

    del?.onClick?.(mockUser);
    expect(mockDeleteUsers).toHaveBeenCalledWith([mockUser]);
  });
});
