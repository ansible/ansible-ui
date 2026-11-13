import {
  IPageActionButtonSingle,
  IPageActionLink,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import {
  useMappingPageActions,
  useMappingRowActions,
  useMappingToolbarActions,
} from './useMappingActions';

const mockPageNavigate = vi.fn();
const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);
const mockDeleteMappings = vi.fn();
const mockOpenManageMappingOrder = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useParams: () => ({ id: '12' }),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('./useDeleteMappings', () => ({
  useDeleteMappings: () => mockDeleteMappings,
}));

vi.mock('./useManageMappings', () => ({
  useManageMappings: () => ({ openManageMappingOrder: mockOpenManageMappingOrder }),
}));

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
  refresh: vi.fn(),
} as unknown as IPlatformView<AuthenticatorMap>;

const mapping = {
  id: 3,
  name: 'LDAP mapping',
  authenticator: 12,
  order: 1,
  map_type: AuthenticatorMapType.allow,
} as AuthenticatorMap;

describe('useMappingToolbarActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should expose create, manage, and delete toolbar actions', () => {
    const { result } = renderHook(() => useMappingToolbarActions(mockView, '12'));

    const createAction = result.current.find(
      (action): action is IPageActionLink =>
        action.type === PageActionType.Link && action.label === 'Create mapping'
    );
    expect(createAction?.href).toBeDefined();
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.CreateAuthenticatorMapping, {
      params: { id: '12' },
    });

    const manageAction = result.current.find(
      (action): action is IPageActionButtonSingle<AuthenticatorMap> =>
        action.type === PageActionType.Button && action.label === 'Manage mappings'
    );
    manageAction?.onClick?.(undefined as never);
    expect(mockOpenManageMappingOrder).toHaveBeenCalled();

    const deleteAction = result.current.find(
      (action): action is IPageActionButtonSingle<AuthenticatorMap> =>
        action.type === PageActionType.Button && action.label === 'Delete mappings'
    );
    expect(deleteAction?.selection).toBe(PageActionSelection.Multiple);
  });
});

describe('useMappingRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should navigate on edit and delete a single mapping', () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useMappingRowActions(onDeleted));

    const editAction = result.current.find(
      (action): action is IPageActionButtonSingle<AuthenticatorMap> =>
        action.type === PageActionType.Button && action.label === 'Edit mapping'
    );
    editAction?.onClick(mapping);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditAuthenticatorMapping, {
      params: { id: 12, map_id: 3 },
    });

    const deleteAction = result.current.find(
      (action): action is IPageActionButtonSingle<AuthenticatorMap> =>
        action.type === PageActionType.Button && action.label === 'Delete mapping'
    );
    deleteAction?.onClick(mapping);
    expect(mockDeleteMappings).toHaveBeenCalledWith([mapping]);
  });
});

describe('useMappingPageActions', () => {
  test('should mirror edit and delete page actions', () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useMappingPageActions(onDeleted));

    const editAction = result.current.find(
      (action): action is IPageActionButtonSingle<AuthenticatorMap> =>
        action.type === PageActionType.Button && action.label === 'Edit mapping'
    );
    editAction?.onClick(mapping);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditAuthenticatorMapping, {
      params: { id: 12, map_id: 3 },
    });
  });
});
