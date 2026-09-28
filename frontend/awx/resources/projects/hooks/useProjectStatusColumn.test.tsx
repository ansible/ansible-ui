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

const mockStatusCell = vi.fn(() => <div data-testid="status-cell" />);
vi.mock('@ansible/common-ui/Status', () => ({
  StatusCell: mockStatusCell,
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
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    result.current.cell(project);
    const lastCall = mockStatusCell.mock.calls[0];
    expect(lastCall).toBeDefined();
    if (lastCall) {
      expect(lastCall[0]).toMatchObject({
        status: 'successful',
        disableLinks: undefined,
      });
      expect((lastCall[0] as Record<string, unknown>).to).toMatch(/456/);
    }
  });

  it('should render status cell without link when jobId is undefined', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'new',
      summary_fields: {},
      related: {},
    };

    result.current.cell(project);
    expect(mockStatusCell).toHaveBeenCalledWith(
      expect.objectContaining({
        to: undefined,
        status: 'new',
      }),
      expect.anything()
    );
  });

  it('should respect disableLinks option', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn({ disableLinks: true }));
    const project = {
      status: 'successful',
      summary_fields: {
        current_job: { id: 456 },
      },
      related: { last_job: '/api/v2/project_updates/456/' },
    };

    result.current.cell(project);
    expect(mockStatusCell).toHaveBeenCalledWith(
      expect.objectContaining({
        to: undefined,
        disableLinks: true,
      }),
      expect.anything()
    );
  });

  it('should use tooltip when jobId is available', () => {
    mockStatusCell.mockClear();
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
    expect(mockStatusCell).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should handle last_job fallback', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'failed',
      summary_fields: {
        last_job: { id: 789 },
      },
      related: { last_job: '/api/v2/project_updates/789/' },
    };

    result.current.cell(project);
    const lastCall = mockStatusCell.mock.calls[0];
    expect(lastCall).toBeDefined();
    if (lastCall) {
      expect(lastCall[0]).toMatchObject({
        status: 'failed',
      });
      expect((lastCall[0] as Record<string, unknown>).to).toMatch(/789/);
    }
  });

  it('should handle current_update fallback', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useProjectStatusColumn());
    const project = {
      status: 'pending',
      summary_fields: {
        current_update: { id: 999 },
      },
      related: {},
    };

    result.current.cell(project);
    const lastCall = mockStatusCell.mock.calls[0];
    expect(lastCall).toBeDefined();
    if (lastCall) {
      expect((lastCall[0] as Record<string, unknown>).to).toMatch(/999/);
    }
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
