import { renderHook } from '@testing-library/react';
import {
  IPageActionButton,
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';

const mockAssociateAdmins = vi.fn();
const mockRemoveAdmins = vi.fn();
const mockUseOptionsReturn = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '42' }),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual('@ansible/common-ui/crud/useGet');
  return {
    ...actual,
    useGetItem: () => ({
      data: { id: 9, name: 'Team Nine' } as PlatformTeam,
      isLoading: false,
      error: null,
    }),
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (...args: unknown[]) => mockUseOptionsReturn(...args) as unknown,
}));

vi.mock('./useAssociateTeamAdmins', () => ({
  useAssociateTeamAdmins: () => mockAssociateAdmins,
}));

vi.mock('./useRemoveTeamAdmins', () => ({
  useRemoveTeamAdmins: () => mockRemoveAdmins,
}));

import { useTeamAdminsRowActions, useTeamAdminsToolbarActions } from './useTeamAdminsActions';

const mockUser: PlatformUser = {
  id: 1,
  url: '/u/1',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: {},
  summary_fields: {
    modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
    created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
    resource: { ansible_id: 'a', resource_type: 'user' },
  },
  username: 'alice',
  last_login_map_results: [],
  managed: false,
};

describe('useTeamAdminsToolbarActions', () => {
  const view = {
    refresh: vi.fn(),
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IPlatformView<PlatformUser>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { PUT: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should wire add and bulk remove to associate and remove hooks when team is editable', () => {
    const { result } = renderHook(() => useTeamAdminsToolbarActions(view));

    const add = result.current.find(
      (a): a is IPageActionButton =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.None
    );
    expect(add?.label).toBe('Add administrators');
    expect(add?.isDisabled).toBeUndefined();
    add?.onClick();
    expect(mockAssociateAdmins).toHaveBeenCalled();

    const removeMany = result.current.find(
      (a): a is IPageActionButtonMultiple<PlatformUser> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Multiple
    );
    expect(removeMany?.label).toBe('Remove administrators');
    const users = [mockUser];
    removeMany?.onClick(users);
    expect(mockRemoveAdmins).toHaveBeenCalledWith(users);
  });

  test('should disable add and remove when team cannot be edited', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamAdminsToolbarActions(view));

    const add = result.current.find(
      (a): a is IPageActionButton =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.None
    );
    expect(typeof add?.isDisabled).toBe('string');

    const removeMany = result.current.find(
      (a): a is IPageActionButtonMultiple<PlatformUser> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Multiple
    );
    expect(typeof removeMany?.isDisabled).toBe('string');
  });
});

describe('useTeamAdminsRowActions', () => {
  const view = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IPlatformView<PlatformUser>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { PATCH: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should remove single administrator when permitted', () => {
    const { result } = renderHook(() => useTeamAdminsRowActions(view));

    const removeOne = result.current.find(
      (a): a is IPageActionButtonSingle<PlatformUser> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Single
    );
    expect(removeOne).toBeDefined();
    expect(removeOne?.isDisabled).toBe('');
    removeOne?.onClick(mockUser);
    expect(mockRemoveAdmins).toHaveBeenCalledWith([mockUser]);
  });

  test('should disable row remove when team cannot be edited', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamAdminsRowActions(view));
    const removeOne = result.current.find(
      (a): a is IPageActionButtonSingle<PlatformUser> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Single
    );
    expect(removeOne?.isDisabled).toBe(
      'The administrator cannot be removed due to insufficient permissions.'
    );
  });
});
