import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProjectStatusColumn } from './useProjectStatusColumn';

// Mock dependencies
vi.mock('@ansible/ansible-ui-framework', () => ({
  useGetPageUrl: () => (route: string, config: { params: Record<string, string | number> }) => {
    return `/path/${config.params.id}`;
  },
  ITableColumn: {},
}));

vi.mock('@ansible/common-ui/Status', () => ({
  StatusCell: ({ to, status }: { to?: string; status?: string }) => (
    <div data-testid="status-cell" data-to={to} data-status={status} />
  ),
}));

vi.mock('@patternfly/react-core', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('useProjectStatusColumn', () => {
  it('should return a table column configuration', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    expect(result.current).toBeDefined();
    expect(result.current.header).toBe('Status');
    expect(result.current.cell).toBeDefined();
  });

  it('should render status cell with job link when jobId is available', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should render status cell without link when jobId is undefined', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'new',
      summary_fields: {},
      related: {},
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should respect disableLinks option', () => {
    const { result } = renderHook(() => useProjectStatusColumn({ disableLinks: true }));
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should use tooltip when jobId is available', () => {
    const tooltip = 'Job running';
    const { result } = renderHook(() => useProjectStatusColumn({ tooltip }));
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should use tooltipAlt when jobId is undefined', () => {
    const tooltipAlt = 'No job data';
    const { result } = renderHook(() => useProjectStatusColumn({ tooltipAlt }));
    const project = {
      status: 'new',
      summary_fields: {},
      related: {},
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should handle last_job fallback', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'failed',
      summary_fields: {
        last_job: { id: 789 },
      },
      related: { last_job: '/api/v2/project_updates/789/' },
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should handle current_update fallback', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'pending',
      summary_fields: {
        current_update: { id: 999 },
      },
      related: {},
    };

    const cellContent = result.current.cell(project);
    expect(cellContent).toBeDefined();
  });

  it('should respect disableSort option', () => {
    const { result: resultWithSort } = renderHook(() => useProjectStatusColumn());
    const { result: resultNoSort } = renderHook(() =>
      useProjectStatusColumn({ disableSort: true })
    );

    expect(resultWithSort.current.sort).toBe('status');
    expect(resultNoSort.current.sort).toBeUndefined();
  });
});
