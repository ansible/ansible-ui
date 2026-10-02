import {
  IPageActionButtonSingle,
  IPageActionLink,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import {
  useAuthenticatorRowActions,
  useAuthenticatorToolbarActions,
} from './useAuthenticatorActions';

const mockPageNavigate = vi.fn();
const mockSetDialog = vi.fn();
const mockDeleteAuthenticators = vi.fn();
const mockGetPageUrl = vi.fn((route: string) => `/mock/${route}`);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
    usePageDialog: () => [null, mockSetDialog],
    usePageAlertToaster: () => ({ addAlert: vi.fn() }),
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: { actions: { POST: {} } } }),
}));

vi.mock('./useDeleteAuthenticators', () => ({
  useDeleteAuthenticators: () => mockDeleteAuthenticators,
}));

vi.mock('./useReorderAuthenticators', () => ({
  ReorderAuthenticatorsModal: () => null,
}));

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
} as unknown as IPlatformView<Authenticator>;

const authenticator = {
  id: 4,
  name: 'LDAP',
  enabled: true,
} as Authenticator;

describe('useAuthenticatorToolbarActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should expose create and manage toolbar actions when POST is allowed', () => {
    const { result } = renderHook(() => useAuthenticatorToolbarActions(mockView));

    expect(result.current.length).toBeGreaterThanOrEqual(3);
    expect(
      result.current.some(
        (action) => action.type === PageActionType.Link && action.label === 'Create authentication'
      )
    ).toBe(true);
    const createAction = result.current.find(
      (action): action is IPageActionLink =>
        action.type === PageActionType.Link && action.label === 'Create authentication'
    );
    expect(createAction?.href).toBeDefined();
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.CreateAuthenticator);
  });
});

describe('useAuthenticatorRowActions', () => {
  test('should navigate to edit authenticator on edit action', () => {
    const { result } = renderHook(() => useAuthenticatorRowActions(mockView));
    const editAction = result.current.find(
      (action): action is IPageActionButtonSingle<Authenticator> =>
        action.type === PageActionType.Button &&
        action.selection === PageActionSelection.Single &&
        action.label === 'Edit authentication'
    );

    editAction?.onClick(authenticator);

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditAuthenticator, {
      params: { id: 4 },
    });
  });
});
