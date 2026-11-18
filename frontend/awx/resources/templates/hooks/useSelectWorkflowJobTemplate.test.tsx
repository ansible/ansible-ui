import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useSelectWorkflowJobTemplate } from './useSelectWorkflowJobTemplate';

const mockSetDialog = vi.fn();
const mockFilters = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'created_by', label: 'Created by' },
  { key: 'modified_by', label: 'Modified by' },
];
const mockColumns = [{ header: 'Name', sort: 'name' }];

const minimalView = {
  page: 1,
  perPage: 10,
  itemCount: 0,
  pageItems: [],
  error: undefined,
  refresh: vi.fn(),
};

const mockUseAwxView = vi.fn(() => minimalView);

let capturedSingleSelectDialogProps: Record<string, unknown> | undefined;

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageDialog: (): [unknown, typeof mockSetDialog] => [undefined, mockSetDialog],
}));

vi.mock('@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog', () => ({
  SingleSelectDialog: (props: Record<string, unknown>) => {
    capturedSingleSelectDialogProps = props;
    return <div data-testid="single-select-dialog-mock" />;
  },
}));

vi.mock('../../../common/awx-toolbar-filters', () => ({
  useNameToolbarFilter: vi.fn(() => mockFilters[0]),
  useDescriptionToolbarFilter: vi.fn(() => mockFilters[1]),
  useCreatedByToolbarFilter: vi.fn(() => mockFilters[2]),
  useModifiedByToolbarFilter: vi.fn(() => mockFilters[3]),
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: (options: unknown) => mockUseAwxView(options),
}));

vi.mock('./useTemplateColumns', () => ({
  useTemplateColumns: vi.fn(() => mockColumns),
}));

describe('useSelectWorkflowJobTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSingleSelectDialogProps = undefined;
    mockUseAwxView.mockImplementation(() => minimalView);
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

  it('invokes parent onSelect when dialog reports a template choice', () => {
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());
    const onSelect = vi.fn();
    const template = { id: 8, name: 'WF Template' } as WorkflowJobTemplate;

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      onSelect: (template: WorkflowJobTemplate) => void;
    }>;
    dialogElement.props.onSelect(template);
    expect(onSelect).toHaveBeenCalledWith(template);
  });

  it('wires SelectWorkflowJobTemplate to workflow job templates list view', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectWorkflowJobTemplate());

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement;
    render(dialogElement);

    expect(capturedSingleSelectDialogProps).toMatchObject({
      title: 'Select workflow job template',
      onSelect,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      view: minimalView,
    });

    expect(mockUseAwxView).toHaveBeenCalledWith({
      url: awxAPI`/workflow_job_templates/`,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      disableQueryString: true,
    });
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
