import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePageDialog } from '@ansible/ansible-ui-framework';
import { AwxUser } from '../../../interfaces/User';
import { useSelectUsers } from './useSelectUsers';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageDialog: vi.fn(),
}));
vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({
    pageItems: [],
    selectedItems: [],
  })),
}));
vi.mock('./useUsersColumns', () => ({
  useUsersColumns: vi.fn(() => []),
}));
vi.mock('./useUsersFilters', () => ({
  useUsersFilters: vi.fn(() => []),
}));
vi.mock('../../common/useUserAndTeamRolesLists', () => ({
  useUserAndTeamRolesLists: vi.fn(),
}));

describe('useSelectUsers', () => {
  const setDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageDialog).mockReturnValue([null, setDialog]);
  });

  it('opens multi-select dialog with title and callback', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectUsers());
    result.current('Pick users', onSelect, 'Confirm', '/api/v2/custom/users/');

    expect(setDialog).toHaveBeenCalledTimes(1);
    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    expect(React.isValidElement(dialogElement)).toBe(true);
    if (!React.isValidElement(dialogElement)) {
      throw new Error('expected dialog element');
    }
    const props = dialogElement.props as {
      title: string;
      onSelect: (users: AwxUser[]) => void;
      accessUrl: string;
    };
    expect(props.title).toBe('Pick users');
    expect(props.accessUrl).toBe('/api/v2/custom/users/');
    props.onSelect([{ id: 1 } as AwxUser]);
    expect(onSelect).toHaveBeenCalledWith([{ id: 1 }]);
  });
});
