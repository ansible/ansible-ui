/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useDeleteUsers } from './useDeleteUser';

describe('useDeleteUsers', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const createMockUser = (overrides: Partial<EdaUser> = {}): EdaUser =>
    ({
      id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      is_superuser: false,
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
      ...overrides,
    }) as EdaUser;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should accept an array of users when called', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });

    const users = [createMockUser({ id: 1, username: 'user1' })];

    expect(() => result.current(users)).not.toThrow();
  });

  it('should handle multiple users', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });

    const users = [
      createMockUser({ id: 1, username: 'user_a' }),
      createMockUser({ id: 2, username: 'user_b' }),
      createMockUser({ id: 3, username: 'user_c' }),
    ];

    expect(() => result.current(users)).not.toThrow();
  });

  it('should handle an empty array of users', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });

    expect(() => result.current([])).not.toThrow();
  });
});
