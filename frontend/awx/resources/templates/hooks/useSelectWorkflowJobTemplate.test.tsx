import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectWorkflowJobTemplate } from './useSelectWorkflowJobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: vi.fn(() => [undefined, mockSetDialog]),
  };
});

vi.mock('../../../common/awx-toolbar-filters', () => ({
  useNameToolbarFilter: vi.fn(() => ({ key: 'name', label: 'Name' })),
  useDescriptionToolbarFilter: vi.fn(() => ({ key: 'description', label: 'Description' })),
  useCreatedByToolbarFilter: vi.fn(() => ({ key: 'created_by', label: 'Created by' })),
  useModifiedByToolbarFilter: vi.fn(() => ({ key: 'modified_by', label: 'Modified by' })),
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({
    pageItems: [],
    itemCount: 0,
    error: undefined,
    refresh: vi.fn(),
  })),
}));

vi.mock('./useTemplateColumns', () => ({
  useTemplateColumns: vi.fn(() => [{ header: 'Name', sort: 'name' }]),
}));

describe('useSelectWorkflowJobTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a callable function', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());

    expect(typeof result.current).toBe('function');
  });

  it('should call setDialog when the returned function is invoked', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });

  it('should open a dialog with the correct title', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      title: string;
    }>;
    expect(dialogElement.props.title).toBe('Select workflow job template');
  });

  it('should pass the onSelect callback to the dialog', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      onSelect: (template: WorkflowJobTemplate) => void;
    }>;
    expect(dialogElement.props.onSelect).toBe(onSelect);
  });

  it('should return a stable function reference across renders', () => {
    const { result, rerender } = renderHook(() => useSelectWorkflowJobTemplate());
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('should pass a SelectWorkflowJobTemplate component as the dialog', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement;
    expect(dialogElement).toBeTruthy();
    expect((dialogElement.type as { name?: string }).name).toBe('SelectWorkflowJobTemplate');
  });

  it('should forward different onSelect callbacks on subsequent calls', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelectFirst = vi.fn();
    const onSelectSecond = vi.fn();

    result.current(onSelectFirst);
    result.current(onSelectSecond);

    const firstDialog = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      onSelect: (template: WorkflowJobTemplate) => void;
    }>;
    const secondDialog = mockSetDialog.mock.calls[1][0] as React.ReactElement<{
      onSelect: (template: WorkflowJobTemplate) => void;
    }>;
    expect(firstDialog.props.onSelect).toBe(onSelectFirst);
    expect(secondDialog.props.onSelect).toBe(onSelectSecond);
  });
});
