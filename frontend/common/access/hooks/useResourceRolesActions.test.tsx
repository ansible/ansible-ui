/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useResourceRolesActions } from './useResourceRolesActions';

describe('useResourceRolesActions', () => {
  it('should return an array with a manage roles action', () => {
    const { result } = renderHook(() => useResourceRolesActions('manage-roles-route', '1'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].label).toBe('Manage roles');
  });

  it('should return a pinned button action', () => {
    const { result } = renderHook(() => useResourceRolesActions('manage-roles-route', '1'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const action = result.current[0];
    expect(action.isPinned).toBe(true);
    expect(action.type).toBeDefined();
    expect(action.selection).toBeDefined();
  });
});
