import { renderHook } from '@testing-library/react';
import {
  IPageActionButton,
  IPageActionButtonMultiple,
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';

const mockPageNavigate = vi.fn();
const mockRemoveTeamRoles = vi.fn();
const mockUseOptionsReturn = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '42' }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

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

vi.mock('./useRemoveTeamRoleAssignments', () => ({
  useRemoveTeamRoleAssignments: () => mockRemoveTeamRoles,
}));

import { useTeamRolesRowActions, useTeamRolesToolbarActions } from './useTeamRolesActions';

const mockAssignment: TeamAssignment = {
  id: 1,
  team: 9,
  object_id: 'obj-1',
  content_type: 'team',
  role_definition: 100,
  summary_fields: {
    team: { id: 9, name: 't9' },
    object_role: { id: 1 },
    role_definition: {
      id: 100,
      name: 'member',
      description: '',
      managed: false,
    },
    content_object: { name: 'nested', id: 2 },
  },
};

describe('useTeamRolesToolbarActions', () => {
  const view = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IPlatformView<TeamAssignment>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { PUT: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should navigate to assign roles and wire bulk remove when team is editable', () => {
    const { result } = renderHook(() => useTeamRolesToolbarActions(view));

    const assign = result.current.find(
      (a): a is IPageActionButton =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.None
    );
    expect(assign?.label).toBe('Assign roles');
    expect(assign?.isDisabled).toBeUndefined();
    assign?.onClick();
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.TeamAssignRoles, {
      params: { id: '42' },
    });

    const removeMany = result.current.find(
      (a): a is IPageActionButtonMultiple<TeamAssignment> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Multiple
    );
    expect(removeMany?.label).toBe('Remove roles');
    const roles = [mockAssignment];
    removeMany?.onClick(roles);
    expect(mockRemoveTeamRoles).toHaveBeenCalledWith(roles);
  });

  test('should disable assign and bulk remove when team cannot be edited', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamRolesToolbarActions(view));

    const assign = result.current.find(
      (a): a is IPageActionButton =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.None
    );
    expect(typeof assign?.isDisabled).toBe('string');

    const removeMany = result.current.find(
      (a): a is IPageActionButtonMultiple<TeamAssignment> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Multiple
    );
    expect(typeof removeMany?.isDisabled).toBe('string');
  });
});

describe('useTeamRolesRowActions', () => {
  const view = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IPlatformView<TeamAssignment>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { PATCH: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should remove single role assignment when permitted', () => {
    const { result } = renderHook(() => useTeamRolesRowActions(view));

    const removeOne = result.current.find(
      (a): a is IPageActionButtonSingle<TeamAssignment> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Single
    );
    expect(removeOne).toBeDefined();
    expect(removeOne?.isDisabled).toBe('');
    removeOne?.onClick(mockAssignment);
    expect(mockRemoveTeamRoles).toHaveBeenCalledWith([mockAssignment]);
  });

  test('should disable row remove when team cannot be edited', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamRolesRowActions(view));
    const removeOne = result.current.find(
      (a): a is IPageActionButtonSingle<TeamAssignment> =>
        a.type === PageActionType.Button && a.selection === PageActionSelection.Single
    );
    expect(removeOne?.isDisabled).toBe(
      'The role cannot be removed due to insufficient permissions.'
    );
  });
});
