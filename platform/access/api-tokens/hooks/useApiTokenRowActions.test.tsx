import {
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Token } from '../../../interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useApiTokenRowActions } from './useApiTokenRowActions';

const mockPageNavigate = vi.fn();
const mockDeleteTokens = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
  };
});

vi.mock('../../users/hooks/useDeleteAAPUserTokens', () => ({
  useDeleteUserTokens: () => mockDeleteTokens,
}));

const token: Token = {
  id: 9,
  type: 'o_auth2_access_token',
  url: '/tokens/9/',
  token: 'x',
  description: 'row token',
  created: '',
  modified: '',
  user: 1,
  application: 1,
  scope: 'read',
  expires: '',
  last_used: null,
  summary_fields: {
    user: { id: 1, username: 'u', first_name: '', last_name: '' },
    application: { id: 1, name: 'App' },
  },
};

function findButton(actions: ReturnType<typeof useApiTokenRowActions>, label: string) {
  return actions.find(
    (action): action is IPageActionButtonSingle<Token> =>
      action.type === PageActionType.Button &&
      action.selection === PageActionSelection.Single &&
      action.label === label
  );
}

describe('useApiTokenRowActions', () => {
  test('should navigate to edit API token route', () => {
    const { result } = renderHook(() => useApiTokenRowActions());
    const editAction = findButton(result.current, 'Edit API token');

    editAction?.onClick(token);

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditApiToken, {
      params: { tokenid: 9 },
    });
  });

  test('should delete token when delete action is invoked', () => {
    const { result } = renderHook(() => useApiTokenRowActions());
    const deleteAction = findButton(result.current, 'Delete API token');

    deleteAction?.onClick(token);

    expect(mockDeleteTokens).toHaveBeenCalledWith([token]);
  });
});
