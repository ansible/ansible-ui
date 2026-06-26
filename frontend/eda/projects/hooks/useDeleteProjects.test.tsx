/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaProject } from '../../interfaces/EdaProject';
import { useDeleteProjects } from './useDeleteProjects';

describe('useDeleteProjects', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const createMockProject = (overrides: Partial<EdaProject> = {}): EdaProject =>
    ({
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      url: 'https://github.com/test/repo',
      import_state: 'completed',
      update_revision_on_launch: false,
      scm_update_cache_timeout: 0,
      ...overrides,
    }) as EdaProject;

  it('should return a function', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    expect(typeof result.current).toBe('function');
  });

  it('should accept an array of projects when called', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    const projects = [createMockProject({ id: 1, name: 'Project A' })];

    expect(() => result.current(projects)).not.toThrow();
  });

  it('should handle multiple projects', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    const projects = [
      createMockProject({ id: 1, name: 'Project A' }),
      createMockProject({ id: 2, name: 'Project B' }),
      createMockProject({ id: 3, name: 'Project C' }),
    ];

    expect(() => result.current(projects)).not.toThrow();
  });

  it('should handle an empty array of projects', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteProjects(onComplete), { wrapper });

    expect(() => result.current([])).not.toThrow();
  });
});
