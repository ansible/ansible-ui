/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { statusCellMock }: { statusCellMock: any } = vi.hoisted(() => {
  const mockFn = vi.fn(() => <div data-testid="status-cell" />);
  return { statusCellMock: mockFn };
});

vi.mock('@ansible/common-ui/Status', () => ({
  StatusCell: statusCellMock,
}));

vi.mock('@patternfly/react-core', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function getMockStatusCell() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return statusCellMock;
}

describe('useProjectStatusColumn', () => {
  it('should return a table column configuration', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    expect(result.current).toBeDefined();
    expect(result.current.header).toBe('Status');
    expect(result.current.cell).toBeDefined();
  });

  it('should render status cell with job link when jobId is available', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      status: 'successful',
      disableLinks: undefined,
    });
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/456/);
  });

  it('should render status cell without link when jobId is undefined', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'new',
      summary_fields: {},
      related: {},
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      to: undefined,
      status: 'new',
    });
  });

  it('should respect disableLinks option', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn({ disableLinks: true }));
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      to: undefined,
      disableLinks: true,
    });
  });

  it('should use tooltip when jobId is available', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const tooltip = 'Job running';
    const { result } = renderHook(() => useProjectStatusColumn({ tooltip }));
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    result.current.cell(project);
    expect(mockCell).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should handle last_job fallback', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'failed',
      summary_fields: {
        last_job: { id: 789 },
      },
      related: { last_job: '/api/v2/project_updates/789/' },
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      status: 'failed',
    });
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/789/);
  });

  it('should handle current_update fallback', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'pending',
      summary_fields: {
        current_update: { id: 999 },
      },
      related: {},
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/999/);
  });

  it('should respect disableSort option', () => {
    const { result: resultWithSort } = renderHook(() => useProjectStatusColumn());
    const { result: resultNoSort } = renderHook(() =>
      useProjectStatusColumn({ disableSort: true })
    );

    expect(resultWithSort.current.sort).toBe('status');
    expect(resultNoSort.current.sort).toBeUndefined();
  });

  it('should prefer current_job over last_job', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'error',
      summary_fields: {
        current_job: { id: 111 },
        last_job: { id: 222 },
      },
      related: { last_job: '/api/v2/project_updates/111/' },
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/111/);
  });

  it('should use related URL as fallback when no summary fields have ids', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'pending',
      summary_fields: {
        current_job: {},
        last_job: {},
      },
      related: { last_job: '/api/v2/project_updates/333/' },
    };

    result.current.cell(project);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/333/);
  });

  it('should handle tooltipAlt when no job id available', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const tooltipAlt = 'No job data available';
    const { result } = renderHook(() => useProjectStatusColumn({ tooltipAlt }));
    const project = {
      status: 'new',
      summary_fields: {},
      related: {},
    };

    result.current.cell(project);
    expect(mockCell).toHaveBeenCalled();
  });
});
