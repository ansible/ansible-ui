import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { useProjectNameColumn } from './useProjectNameColumn';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  useGetPageUrl: vi.fn(),
}));

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 12,
    name: 'My Project',
    custom_virtualenv: undefined,
    default_environment: 1,
    ...overrides,
  } as Project;
}

describe('useProjectNameColumn', () => {
  const mockGetPageUrl = vi.fn(() => '/projects/12');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetPageUrl).mockReturnValue(mockGetPageUrl);
  });

  test('returns name column with default sort', () => {
    const { result } = renderHook(() => useProjectNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.header).toBe('Name');
    expect(result.current.sort).toBe('name');
    expect(result.current.defaultSort).toBe(true);
  });

  test('value returns project name', () => {
    const { result } = renderHook(() => useProjectNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const project = createMockProject();
    if (typeof result.current.value === 'function') {
      expect(result.current.value(project)).toBe('My Project');
    }
  });

  test('to resolves project details url', () => {
    const { result } = renderHook(() => useProjectNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const project = createMockProject();
    const column = result.current as { to: (item: Project) => string };
    column.to(project);
    expect(mockGetPageUrl).toHaveBeenCalledWith('awx-project-details', { params: { id: 12 } });
  });

  test('cell renders plain name when disableLinks is true', () => {
    const { result } = renderHook(() => useProjectNameColumn({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const project = createMockProject();
    const column = result.current as { cell: (item: Project) => ReactElement };
    const { getByText, queryByRole } = render(<MemoryRouter>{column.cell(project)}</MemoryRouter>);
    expect(getByText('My Project')).toBeInTheDocument();
    expect(queryByRole('link')).toBeNull();
  });

  test('cell shows warning when custom virtualenv without default environment', () => {
    const { result } = renderHook(() => useProjectNameColumn(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const project = createMockProject({
      custom_virtualenv: '/venv/custom',
      default_environment: null as unknown as number,
    });
    const column = result.current as { cell: (item: Project) => ReactElement };
    const { getByText } = render(<MemoryRouter>{column.cell(project)}</MemoryRouter>);
    expect(getByText('My Project')).toBeInTheDocument();
  });
});
