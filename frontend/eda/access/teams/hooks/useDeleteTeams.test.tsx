/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { useDeleteTeams } from './useDeleteTeams';

describe('useDeleteTeams', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const createMockTeam = (overrides: Partial<EdaTeam> = {}): EdaTeam =>
    ({
      id: 1,
      name: 'Test Team',
      description: 'A test team',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      ...overrides,
    }) as EdaTeam;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should accept an array of teams when called', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    const teams = [createMockTeam({ id: 1, name: 'Team A' })];

    expect(() => result.current(teams)).not.toThrow();
  });

  it('should handle multiple teams', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    const teams = [
      createMockTeam({ id: 1, name: 'Team A' }),
      createMockTeam({ id: 2, name: 'Team B' }),
      createMockTeam({ id: 3, name: 'Team C' }),
    ];

    expect(() => result.current(teams)).not.toThrow();
  });

  it('should handle an empty array of teams', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteTeams(onComplete), { wrapper });

    expect(() => result.current([])).not.toThrow();
  });
});
