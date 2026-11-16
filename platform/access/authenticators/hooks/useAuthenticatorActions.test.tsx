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

const {
  mockPageNavigate,
  mockSetDialog,
  mockDeleteAuthenticators,
  mockGetPageUrl,
  mockAddAlert,
  mockRequestPatch,
  mockUseOptions,
} = vi.hoisted(() => ({
  mockPageNavigate: vi.fn(),
  mockSetDialog: vi.fn(),
  mockDeleteAuthenticators: vi.fn(),
  mockGetPageUrl: vi.fn((route: string) => `/mock/${route}`),
  mockAddAlert: vi.fn(),
  mockRequestPatch: vi.fn(() => Promise.resolve({ id: 4, name: 'LDAP', enabled: true })),
  mockUseOptions: vi.fn((): { data: { actions: Record<string, Record<string, never>> } } => ({
    data: { actions: { POST: {}, PATCH: {} } },
  })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useParams: () => ({ id: '4' }),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
    usePageNavigate: () => mockPageNavigate,
    usePageDialog: () => [null, mockSetDialog],
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: mockUseOptions,
}));

vi.mock('@ansible/common-ui/crud/Data', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@ansible/common-ui/crud/Data')>();
  return {
    ...mod,
    requestPatch: mockRequestPatch,
  };
});

vi.mock('./useDeleteAuthenticators', () => ({
  useDeleteAuthenticators: () => mockDeleteAuthenticators,
}));

vi.mock('./useReorderAuthenticators', () => ({
  ReorderAuthenticatorsModal: () => null,
}));

import {
  useAuthenticatorPageActions,
  useAuthenticatorRowActions,
  useAuthenticatorToolbarActions,
} from './useAuthenticatorActions';

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
    mockUseOptions.mockReturnValue({ data: { actions: { POST: {} } } });
  });

  test('should disable create and manage when POST is not allowed', () => {
    mockUseOptions.mockReturnValue({ data: { actions: {} } });
    const { result } = renderHook(() => useAuthenticatorToolbarActions(mockView));

    const createAction = result.current.find(
      (action): action is IPageActionLink =>
        action.type === PageActionType.Link && action.label === 'Create authentication'
    );
    expect(createAction?.isDisabled).toBeTruthy();
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  test('should call delete authenticator hook from row delete action', () => {
    const { result } = renderHook(() => useAuthenticatorRowActions(mockView));
    const deleteAction = result.current.find(
      (action): action is IPageActionButtonSingle<Authenticator> =>
        action.type === PageActionType.Button && action.label === 'Delete authentication'
    );

    deleteAction?.onClick(authenticator);
    expect(mockDeleteAuthenticators).toHaveBeenCalledWith([authenticator]);
  });

  test('should toggle enabled and refresh on success', async () => {
    const { result } = renderHook(() => useAuthenticatorRowActions(mockView));
    const toggleAction = result.current.find((action) => action.type === PageActionType.Switch);

    await toggleAction?.onToggle?.(authenticator as Authenticator & boolean, true);

    expect(mockRequestPatch).toHaveBeenCalledWith('/api/gateway/v1/authenticators/4/', {
      enabled: true,
    });
    expect(mockAddAlert).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success', title: 'LDAP enabled.' })
    );
    expect(mockView.unselectItemsAndRefresh).toHaveBeenCalledWith([authenticator]);
  });
});

describe('useAuthenticatorPageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptions.mockReturnValue({ data: { actions: { PATCH: {} } } });
  });

  test('should navigate on edit when PATCH is allowed', () => {
    const onDeleted = vi.fn();
    const onToggle = vi.fn();
    const { result } = renderHook(() => useAuthenticatorPageActions(onDeleted, onToggle));

    const editAction = result.current.find(
      (action): action is IPageActionButtonSingle<Authenticator> =>
        action.type === PageActionType.Button && action.label === 'Edit authentication'
    );
    editAction?.onClick(authenticator);
    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditAuthenticator, {
      params: { id: 4 },
    });
  });

  test('should call onToggle after enable switch succeeds', async () => {
    const onDeleted = vi.fn();
    const onToggle = vi.fn();
    const { result } = renderHook(() => useAuthenticatorPageActions(onDeleted, onToggle));
    const switchAction = result.current.find((action) => action.type === PageActionType.Switch);

    await switchAction?.onToggle?.(authenticator as Authenticator & boolean, false);

    expect(onToggle).toHaveBeenCalled();
    expect(mockRequestPatch).toHaveBeenCalledWith('/api/gateway/v1/authenticators/4/', {
      enabled: false,
    });
  });
});
