/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaActiveUserContext } from '../../../common/useEdaActiveUser';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { useEdaRoleRowActions, useEdaRoleToolbarActions } from './useEdaRoleActions';

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <EdaActiveUserContext.Provider
      value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
    >
      {children}
    </EdaActiveUserContext.Provider>
  </MemoryRouter>
);

describe('useEdaRoleToolbarActions', () => {
  it('should return an array of actions', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleToolbarActions(onComplete), { wrapper });

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Create role action', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleToolbarActions(onComplete), { wrapper });

    const createAction = result.current.find((a) => 'label' in a && a.label === 'Create role');
    expect(createAction).toBeDefined();
  });

  it('should include Delete roles action', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleToolbarActions(onComplete), { wrapper });

    const deleteAction = result.current.find((a) => 'label' in a && a.label === 'Delete roles');
    expect(deleteAction).toBeDefined();
  });
});

describe('useEdaRoleRowActions', () => {
  it('should return an array of row actions', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleRowActions(onComplete), { wrapper });

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Edit role action', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleRowActions(onComplete), { wrapper });

    const editAction = result.current.find((a) => 'label' in a && a.label === 'Edit role');
    expect(editAction).toBeDefined();
  });

  it('should include Delete role action', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleRowActions(onComplete), { wrapper });

    const deleteAction = result.current.find((a) => 'label' in a && a.label === 'Delete role');
    expect(deleteAction).toBeDefined();
  });

  it('should disable Edit for managed roles', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleRowActions(onComplete), { wrapper });

    const editAction = result.current.find((a) => 'label' in a && a.label === 'Edit role');
    expect(editAction).toBeDefined();

    const managedRole = { id: 1, managed: true } as EdaRbacRole;

    expect(
      (editAction as { isDisabled: (item: EdaRbacRole) => string }).isDisabled(managedRole)
    ).toBe('Built-in roles cannot be edited.');
  });

  it('should disable Delete for managed roles', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useEdaRoleRowActions(onComplete), { wrapper });

    const deleteAction = result.current.find((a) => 'label' in a && a.label === 'Delete role');
    expect(deleteAction).toBeDefined();

    const managedRole = { id: 1, managed: true } as EdaRbacRole;

    expect(
      (deleteAction as { isDisabled: (item: EdaRbacRole) => string }).isDisabled(managedRole)
    ).toBe('Built-in roles cannot be deleted.');
  });
});
