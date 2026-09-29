/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProjectStatusColumn } from './useProjectStatusColumn';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { statusCellMock }: { statusCellMock: any } = vi.hoisted(() => {
  const mockFn = vi.fn(() => <div data-testid="status-cell" />);
  return { statusCellMock: mockFn };
});

vi.mock('@ansible/ansible-ui-framework', () => ({
  useGetPageUrl: () => (route: string, config: { params: Record<string, string | number> }) =>
    `/path/${config.params.id}`,
  ITableColumn: {},
}));

vi.mock('@ansible/common-ui/Status', () => ({
  StatusCell: statusCellMock,
}));

vi.mock('@patternfly/react-core', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const getMockStatusCell = () => statusCellMock;

describe('useProjectStatusColumn', () => {
  it('returns column with Status header', () => {
    const { result } = renderHook(() => useProjectStatusColumn());
    expect(result.current.header).toBe('Status');
    expect(result.current.cell).toBeDefined();
  });

  describe('cell rendering', () => {
    it('renders with current_job', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'successful',
        summary_fields: { current_job: { id: 100 } },
        related: { last_job: '/api/v2/project_updates/100/' },
      };

      result.current.cell(project);
      expect(mockCell).toHaveBeenCalled();
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ status: 'successful' });
      expect(mockCell.mock.calls[0]?.[0]?.to).toMatch(/100/);
    });

    it('renders with last_job when current_job missing', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'error',
        summary_fields: { last_job: { id: 200 } },
        related: { last_job: '/api/v2/project_updates/200/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('200') });
    });

    it('renders with current_update fallback', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'running',
        summary_fields: { current_update: { id: 300 } },
        related: {},
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('300') });
    });

    it('renders with related.last_job URL fallback', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'new',
        summary_fields: {},
        related: { last_job: '/api/v2/project_updates/400/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('400') });
    });

    it('renders without link when no job available', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'pending',
        summary_fields: {},
        related: {},
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: undefined });
    });

    it('respects disableLinks option', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn({ disableLinks: true }));

      const project = {
        status: 'successful',
        summary_fields: { current_job: { id: 500 } },
        related: { last_job: '/api/v2/project_updates/500/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: undefined, disableLinks: true });
    });

    it('uses tooltip when job available', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn({ tooltip: 'Running' }));

      const project = {
        status: 'successful',
        summary_fields: { current_job: { id: 600 } },
        related: { last_job: '/api/v2/project_updates/600/' },
      };

      result.current.cell(project);
      expect(mockCell).toHaveBeenCalled();
    });

    it('uses tooltipAlt when no job available', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn({ tooltipAlt: 'No job' }));

      const project = {
        status: 'pending',
        summary_fields: {},
        related: {},
      };

      result.current.cell(project);
      expect(mockCell).toHaveBeenCalled();
    });

    it('handles empty summary fields', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'failed',
        summary_fields: { current_job: {}, last_job: {}, current_update: {} },
        related: { last_job: '/api/v2/project_updates/700/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('700') });
    });

    it('prefers current_job over all fallbacks', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'successful',
        summary_fields: {
          current_job: { id: 800 },
          last_job: { id: 801 },
          current_update: { id: 802 },
        },
        related: { last_job: '/api/v2/project_updates/803/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('800') });
    });

    it('prefers last_job over current_update and URL', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'successful',
        summary_fields: {
          current_job: {},
          last_job: { id: 900 },
          current_update: { id: 901 },
        },
        related: { last_job: '/api/v2/project_updates/902/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('900') });
    });

    it('prefers current_update over URL', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useProjectStatusColumn());

      const project = {
        status: 'successful',
        summary_fields: {
          current_job: {},
          last_job: {},
          current_update: { id: 1000 },
        },
        related: { last_job: '/api/v2/project_updates/1001/' },
      };

      result.current.cell(project);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('1000') });
    });
  });

  describe('sort property', () => {
    it('includes sort by default', () => {
      const { result } = renderHook(() => useProjectStatusColumn());
      expect(result.current.sort).toBe('status');
    });

    it('removes sort when disableSort is true', () => {
      const { result } = renderHook(() => useProjectStatusColumn({ disableSort: true }));
      expect(result.current.sort).toBeUndefined();
    });
  });
});
