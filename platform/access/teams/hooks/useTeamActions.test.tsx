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
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { IPlatformView } from '../../../hooks/usePlatformView';

const mockPageNavigate = vi.fn();
const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);
const mockDeleteTeams = vi.fn();
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

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '42' }),
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (...args: unknown[]) => mockUseOptionsReturn(...args) as unknown,
}));

vi.mock('./useDeleteTeams', () => ({
  useDeleteTeams: () => mockDeleteTeams,
}));

import { useTeamPageActions, useTeamRowActions, useTeamToolbarActions } from './useTeamActions';

function isLinkNone(
  action: ReturnType<typeof useTeamToolbarActions>[number]
): action is IPageActionLink {
  return action.type === PageActionType.Link && action.selection === PageActionSelection.None;
}

function isMultiDelete(
  action: ReturnType<typeof useTeamToolbarActions>[number]
): action is IPageActionButtonMultiple<PlatformTeam> {
  return (
    action.type === PageActionType.Button &&
    action.selection === PageActionSelection.Multiple &&
    action.label === 'Delete teams'
  );
}

function findSingleButton(
  actions: ReturnType<typeof useTeamRowActions>,
  label: string
): IPageActionButtonSingle<PlatformTeam> | undefined {
  return actions.find(
    (a): a is IPageActionButtonSingle<PlatformTeam> =>
      a.type === PageActionType.Button &&
      a.selection === PageActionSelection.Single &&
      a.label === label
  );
}

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
} as unknown as IPlatformView<PlatformTeam>;

const mockTeam: PlatformTeam = {
  id: 99,
  name: 'Team X',
  description: '',
  url: '/api/gateway/v1/teams/99/',
  created: '',
  created_by: '1',
  modified: '',
  modified_by: '1',
  related: {
    created_by: '',
    modified_by: '',
    organization: '',
  },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    organization: { id: 1, name: 'Org' },
    resource: { ansible_id: 'x', resource_type: 'team' },
  },
  organization: 1,
  users: [],
};

describe('useTeamToolbarActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { POST: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should expose create link and bulk delete when POST is allowed', () => {
    const { result } = renderHook(() => useTeamToolbarActions(mockView));

    const createLink = result.current.find(isLinkNone);
    expect(createLink?.label).toBe('Create team');
    expect(createLink?.href).toBe(`/mock/${PlatformRoute.CreateTeam}`);
    expect(createLink?.isDisabled).toBeUndefined();

    const deleteBtn = result.current.find(isMultiDelete);
    expect(deleteBtn).toBeDefined();
    const teams = [mockTeam];
    deleteBtn!.onClick(teams);
    expect(mockDeleteTeams).toHaveBeenCalledWith(teams);
  });

  test('should disable create when POST is not allowed', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamToolbarActions(mockView));

    const createLink = result.current.find(isLinkNone);
    expect(createLink?.isDisabled).toBe(
      'You do not have permission to create a team. Please contact your system administrator if there is an issue with your access.'
    );
  });
});

describe('useTeamRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should navigate to edit and forward delete to hook', () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useTeamRowActions(onDeleted));

    const edit = findSingleButton(result.current, 'Edit team');
    edit?.onClick(mockTeam);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditTeam, {
      params: { id: mockTeam.id },
    });

    const del = findSingleButton(result.current, 'Delete team');
    del?.onClick(mockTeam);
    expect(mockDeleteTeams).toHaveBeenCalledWith([mockTeam]);
  });
});

describe('useTeamPageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: { PUT: true } },
      isLoading: false,
      error: null,
    });
  });

  test('should allow edit and delete when PUT or PATCH is present', () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useTeamPageActions(onDeleted));

    const edit = findSingleButton(result.current, 'Edit team');
    expect(typeof edit?.isDisabled).toBe('function');
    expect((edit!.isDisabled as (t: PlatformTeam) => string)(mockTeam)).toBe('');

    edit?.onClick(mockTeam);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditTeam, {
      params: { id: mockTeam.id },
    });

    const del = findSingleButton(result.current, 'Delete team');
    expect((del!.isDisabled as (t: PlatformTeam) => string)(mockTeam)).toBe('');
    del?.onClick(mockTeam);
    expect(mockDeleteTeams).toHaveBeenCalledWith([mockTeam]);
  });

  test('should disable edit and delete when team cannot be modified', () => {
    mockUseOptionsReturn.mockReturnValue({
      data: { actions: {} },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeamPageActions(vi.fn()));

    const edit = findSingleButton(result.current, 'Edit team');
    expect((edit!.isDisabled as (t: PlatformTeam) => string)(mockTeam)).toBe(
      'The team cannot be edited due to insufficient permissions.'
    );

    const del = findSingleButton(result.current, 'Delete team');
    expect((del!.isDisabled as (t: PlatformTeam) => string)(mockTeam)).toBe(
      'The team cannot be deleted due to insufficient permissions.'
    );
  });
});
