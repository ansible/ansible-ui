import { renderHook } from '@testing-library/react';
import { PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useResourceRolesActions, type RoleAccess } from './useResourceRolesActions';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(),
  };
});

describe('useResourceRolesActions', () => {
  it('should return an array with one action', () => {
    const { result } = renderHook(() => useResourceRolesActions('manage-roles-route', '1'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(1);
  });

  it('should return a button action with correct type', () => {
    const { result } = renderHook(() => useResourceRolesActions('manage-roles-route', '1'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const action = result.current[0];
    expect(action.type).toBe(PageActionType.Button);
    if (action.type === PageActionType.Button) {
      expect(action.label).toBe('Manage roles');
      expect(action.isPinned).toBe(true);
    }
  });

  it('should navigate with parsed resource params when action is clicked', () => {
    const pageNavigate = vi.fn();
    vi.mocked(usePageNavigate).mockReturnValue(pageNavigate);

    const { result } = renderHook(() => useResourceRolesActions('manage-roles-route', '1'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const roleAccess = {
      related: { details: 'project/5/42/extra' },
    } as RoleAccess;

    const action = result.current[0];
    if (action.type === PageActionType.Button) {
      (action.onClick as (item: RoleAccess) => void)?.(roleAccess);
    }

    expect(pageNavigate).toHaveBeenCalledWith('manage-roles-route', {
      params: {
        id: '1',
        resource_type: 'project',
        resource_id: '5',
        user_id: '42',
      },
    });
  });
});
