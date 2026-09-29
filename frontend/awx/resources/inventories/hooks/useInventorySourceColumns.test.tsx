/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { statusCellMock }: { statusCellMock: any } = vi.hoisted(() => {
  const mockFn = vi.fn(() => <div data-testid="status-cell" />);
  return { statusCellMock: mockFn };
});

const useOptionsState = {
  data: {
    actions: {
      GET: {
        source: {
          choices: [
            ['scm', 'Source Control'],
            ['manual', 'Manual'],
            ['ec2', 'Amazon EC2'],
          ] as [string, string][],
        },
      },
    },
  } as Record<string, unknown>,
  error: undefined as Error | undefined,
  isLoading: false,
};

vi.mock('@ansible/ansible-ui-framework', () => ({
  useGetPageUrl: () => (route: string, config: { params: Record<string, string | number> }) =>
    `/path/${config.params.id}`,
  ITableColumn: {},
}));

vi.mock('@ansible/common-ui/Status', () => ({
  StatusCell: statusCellMock,
}));

vi.mock('@ansible/common-ui/columns', () => ({
  useDescriptionColumn: () => ({ header: 'Description' }),
  useNameColumn: () => () => ({ header: 'Name' }),
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => useOptionsState,
}));

vi.mock('../inventorySources/InventorySourceDetails', () => ({
  LastJobTooltip: ({ job }: { job: { id?: number } }) => <div>{job.id}</div>,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const getMockStatusCell = () => statusCellMock;

function findStatusColumn(columns: ReturnType<typeof useInventorySourceColumns>) {
  const col = columns.find((col) => col.header === 'Last job status');
  return col && 'cell' in col
    ? (col as (typeof columns)[0] & { cell: (item: InventorySource) => React.ReactNode })
    : undefined;
}

function findTypeColumn(columns: ReturnType<typeof useInventorySourceColumns>) {
  const col = columns.find((col) => col.header === 'Type' && 'value' in col);
  return col
    ? (col as (typeof columns)[0] & { value: (item: InventorySource) => string })
    : undefined;
}

describe('useInventorySourceColumns', () => {
  it('returns 4 columns', () => {
    const { result } = renderHook(() => useInventorySourceColumns());
    expect(result.current.length).toBe(4);
  });

  describe('status column', () => {
    it('renders with current_job id', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 1,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: { current_job: { id: 100 } },
        related: { schedules: '/', last_job: '/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell).toHaveBeenCalled();
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ status: 'successful' });
    });

    it('renders without link when disableLinks=true', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns({ disableLinks: true }));
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 2,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'error',
        summary_fields: { current_job: { id: 200 } },
        related: { schedules: '/', last_job: '/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: undefined, disableLinks: true });
    });

    it('renders without job data', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 3,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'pending',
        summary_fields: {},
        related: { schedules: '/', last_job: '/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: undefined });
    });

    it('uses last_job when current_job is empty', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 4,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'error',
        summary_fields: { current_job: {}, last_job: { id: 300 } },
        related: { schedules: '/', last_job: '/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('300') });
    });

    it('uses current_update as fallback', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 5,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'running',
        summary_fields: { current_job: {}, last_job: {}, current_update: { id: 400 } },
        related: { schedules: '/', last_job: '/api/v2/inventory_updates/400/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('400') });
    });

    it('uses related.last_job URL as fallback', () => {
      const mockCell = getMockStatusCell();
      mockCell.mockClear();
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findStatusColumn(result.current);
      if (!col) throw new Error('Column not found');

      const source = {
        id: 6,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'new',
        summary_fields: { current_job: {}, last_job: {}, current_update: {} },
        related: { schedules: '/', last_job: '/api/v2/inventory_updates/500/' },
      } as InventorySource;

      col.cell(source);
      expect(mockCell.mock.calls[0]?.[0]).toMatchObject({ to: expect.stringContaining('500') });
    });
  });

  describe('type column', () => {
    it('renders type value from choices', () => {
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findTypeColumn(result.current);
      if (!col?.value) throw new Error('Column not found');

      const source = {
        id: 7,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/' },
      } as InventorySource;

      expect(col.value(source)).toBe('Source Control');
    });

    it('renders type value for manual source', () => {
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findTypeColumn(result.current);
      if (!col?.value) throw new Error('Column not found');

      const source = {
        id: 8,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'manual',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/' },
      } as InventorySource;

      expect(col.value(source)).toBe('Manual');
    });

    it('returns empty string for unknown source', () => {
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findTypeColumn(result.current);
      if (!col?.value) throw new Error('Column not found');

      const source = {
        id: 9,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'unknown',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/' },
      } as InventorySource;

      expect(col.value(source)).toBe('');
    });

    it('returns empty when loading', () => {
      useOptionsState.isLoading = true;
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findTypeColumn(result.current);
      if (!col?.value) throw new Error('Column not found');

      const source = {
        id: 10,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/' },
      } as InventorySource;

      expect(col.value(source)).toBeUndefined();
      useOptionsState.isLoading = false;
    });

    it('returns empty when error', () => {
      useOptionsState.error = new Error('API error');
      const { result } = renderHook(() => useInventorySourceColumns());
      const col = findTypeColumn(result.current);
      if (!col?.value) throw new Error('Column not found');

      const source = {
        id: 11,
        inventory: 1,
        name: 'test',
        description: 'test',
        source: 'scm',
        scm_branch: 'main',
        type: 'inventory_source' as const,
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/' },
      } as InventorySource;

      expect(col.value(source)).toBeUndefined();
      useOptionsState.error = undefined;
    });
  });

  it('respects disableSort option', () => {
    const { result: result1 } = renderHook(() => useInventorySourceColumns());
    const { result: result2 } = renderHook(() => useInventorySourceColumns({ disableSort: true }));

    const col1 = result1.current.find((c) => c.header === 'Type');
    const col2 = result2.current.find((c) => c.header === 'Type');

    expect(col1).toBeDefined();
    expect(col2).toBeDefined();
  });
});
