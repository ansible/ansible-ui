import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

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

vi.mock('@ansible/common-ui/columns', () => ({
  useDescriptionColumn: () => ({ header: 'Description' }),
  useNameColumn: () => () => ({ header: 'Name' }),
}));

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({
    data: undefined,
    error: undefined,
    isLoading: false,
  }),
}));

vi.mock('../inventorySources/InventorySourceDetails', () => ({
  LastJobTooltip: ({ job }: { job: { id?: number } }) => <div>{job.id}</div>,
}));

describe('useInventorySourceColumns', () => {
  it('should return columns array', () => {
    const { result } = renderHook(() => useInventorySourceColumns());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(4);
  });

  it('should include status column with job link when jobId is available', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = result.current.find(
      (col: ITableColumn<InventorySource>) => col.header === 'Last job status'
    );
    expect(statusColumn).toBeDefined();

    const inventorySource = {
      id: 1,
      inventory: 1,
      source: 'scm',
      status: 'successful',
      summary_fields: {
        current_job: { id: 123 },
      },
      related: { schedules: '/api/v2/schedules/', last_job: '/api/v2/inventory_updates/123/' },
    } as InventorySource;

    statusColumn?.cell?.(inventorySource);
    expect(mockStatusCell).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringContaining('123'),
        status: 'successful',
        disableLinks: undefined,
      }),
      expect.anything()
    );
  });

  it('should handle inventory source without job', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = result.current.find(
      (col: ITableColumn<InventorySource>) => col.header === 'Last job status'
    );

    const inventorySource = {
      id: 1,
      inventory: 1,
      source: 'scm',
      status: 'failed',
      summary_fields: {},
      related: { schedules: '/api/v2/schedules/' },
    } as InventorySource;

    statusColumn?.cell?.(inventorySource);
    expect(mockStatusCell).toHaveBeenCalledWith(
      expect.objectContaining({
        to: undefined,
        status: 'failed',
      }),
      expect.anything()
    );
  });

  it('should respect disableLinks option', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns({ disableLinks: true }));
    const statusColumn = result.current.find(
      (col: ITableColumn<InventorySource>) => col.header === 'Last job status'
    );

    const inventorySource = {
      id: 1,
      inventory: 1,
      source: 'scm',
      status: 'successful',
      summary_fields: {
        current_job: { id: 123 },
      },
      related: { schedules: '/api/v2/schedules/', last_job: '/api/v2/inventory_updates/123/' },
    } as InventorySource;

    statusColumn?.cell?.(inventorySource);
    expect(mockStatusCell).toHaveBeenCalledWith(
      expect.objectContaining({
        to: undefined,
        disableLinks: true,
      }),
      expect.anything()
    );
  });
});
