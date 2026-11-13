import { usePageNavigate } from '@ansible/ansible-ui-framework';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { useLastUsedColumn } from './useLastUsedColumn';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Demo',
    last_job_run: '2024-06-01T12:00:00Z',
    summary_fields: {
      modified_by: { id: 2, username: 'admin' },
    },
    ...overrides,
  } as Project;
}

describe('useLastUsedColumn', () => {
  const mockPageNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
  });

  test('returns last used column metadata', () => {
    const { result } = renderHook(() => useLastUsedColumn());

    expect(result.current.header).toBe('Last used');
    expect(result.current.card).toBe('hidden');
    expect(result.current.value).toBeTypeOf('function');
  });

  test('value returns last_job_run when set', () => {
    const { result } = renderHook(() => useLastUsedColumn());
    const project = createMockProject();
    if (typeof result.current.value === 'function') {
      expect(result.current.value(project)).toBe('2024-06-01T12:00:00Z');
    }
  });

  test('value returns undefined when last_job_run missing', () => {
    const { result } = renderHook(() => useLastUsedColumn());
    const project = createMockProject({ last_job_run: undefined });
    if (typeof result.current.value === 'function') {
      expect(result.current.value(project)).toBeUndefined();
    }
  });

  test('cell renders empty fragment without last_job_run', () => {
    const { result } = renderHook(() => useLastUsedColumn());
    const project = createMockProject({ last_job_run: undefined });
    const column = result.current as {
      cell: (item: Project) => ReactElement;
    };
    const { container } = render(column.cell(project));
    expect(container).toBeEmptyDOMElement();
  });

  test('cell renders datetime when last_job_run is present', () => {
    const { result } = renderHook(() => useLastUsedColumn());
    const project = createMockProject();
    const column = result.current as {
      cell: (item: Project) => ReactElement;
    };
    const { container } = render(column.cell(project));
    expect(container.textContent).not.toBe('');
  });
});
