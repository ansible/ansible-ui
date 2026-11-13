import type { ReactElement } from 'react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectProject } from './useSelectProject';
import { Project } from '../../../interfaces/Project';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: vi.fn(() => [undefined, mockSetDialog]),
  };
});

vi.mock('./useProjectsFilters', () => ({
  useProjectsFilters: vi.fn(() => [{ key: 'name', label: 'Name' }]),
}));

vi.mock('./useProjectsColumns', () => ({
  useProjectsColumns: vi.fn(() => [{ header: 'Name', sort: 'name' }]),
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({
    pageItems: [],
    itemCount: 0,
    error: undefined,
    refresh: vi.fn(),
  })),
}));

describe('useSelectProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a callable function', () => {
    const { result } = renderHook(() => useSelectProject());

    expect(typeof result.current).toBe('function');
  });

  it('should call setDialog when the returned function is invoked', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });

  it('should open a dialog with the correct title', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      title: string;
    }>;
    expect(dialogElement.props.title).toBe('Select project');
  });

  it('should pass the onSelect callback to the dialog', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (project: Project) => void;
    }>;
    expect(dialogElement.props.onSelect).toBe(onSelect);
  });

  it('should return a stable function reference across renders', () => {
    const { result, rerender } = renderHook(() => useSelectProject());
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('should pass a SelectProject component as the dialog', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement;
    expect(dialogElement).toBeTruthy();
    expect((dialogElement.type as { name?: string }).name).toBe('SelectProject');
  });

  it('invokes parent onSelect when dialog reports a project choice', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelect = vi.fn();
    const project = { id: 6, name: 'My Project' } as Project;

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (project: Project) => void;
    }>;
    dialogElement.props.onSelect(project);
    expect(onSelect).toHaveBeenCalledWith(project);
  });

  it('should forward different onSelect callbacks on subsequent calls', () => {
    const { result } = renderHook(() => useSelectProject());
    const onSelectFirst = vi.fn();
    const onSelectSecond = vi.fn();

    result.current(onSelectFirst);
    result.current(onSelectSecond);

    const firstDialog = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (project: Project) => void;
    }>;
    const secondDialog = mockSetDialog.mock.calls[1][0] as ReactElement<{
      onSelect: (project: Project) => void;
    }>;
    expect(firstDialog.props.onSelect).toBe(onSelectFirst);
    expect(secondDialog.props.onSelect).toBe(onSelectSecond);
  });
});
