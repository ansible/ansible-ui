/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { PageActionType } from '@ansible/ansible-ui-framework';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useResourceRolesActions } from './useResourceRolesActions';

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
});
