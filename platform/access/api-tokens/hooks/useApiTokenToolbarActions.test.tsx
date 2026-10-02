import {
  IPageActionButtonMultiple,
  IPageActionLink,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { Token } from '../../../interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useApiTokenToolbarActions } from './useApiTokenToolbarActions';

const mockGetPageUrl = vi.fn((route: PlatformRoute) => `/url/${route}`);
const mockDeleteTokens = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
  };
});

vi.mock('../../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({ activePlatformUser: { id: 7 } }),
}));

vi.mock('../../users/hooks/useDeleteAAPUserTokens', () => ({
  useDeleteUserTokens: () => mockDeleteTokens,
}));

const mockView = {
  unselectItemsAndRefresh: vi.fn(),
} as unknown as IPlatformView<Token>;

describe('useApiTokenToolbarActions', () => {
  test('should include create link and bulk delete actions', () => {
    const { result } = renderHook(() => useApiTokenToolbarActions(mockView));

    const createAction = result.current.find(
      (action): action is IPageActionLink =>
        action.type === PageActionType.Link && action.label === 'Create API token'
    );
    const deleteAction = result.current.find(
      (action): action is IPageActionButtonMultiple<Token> =>
        action.type === PageActionType.Button &&
        action.selection === PageActionSelection.Multiple &&
        action.label === 'Delete API tokens'
    );

    expect(createAction?.href).toBe(`/url/${PlatformRoute.CreateApiToken}`);
    deleteAction?.onClick([{ id: 1 } as Token]);
    expect(mockDeleteTokens).toHaveBeenCalled();
  });
});
