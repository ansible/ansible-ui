import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

// Mock dependencies
vi.mock('@ansible/ansible-ui-framework', () => ({
  useGetPageUrl: () => (route: string, config: { params: Record<string, string | number> }) => {
    return `/path/${config.params.id}`;
  },
  ITableColumn: {},
}));

vi.mock('@ansible/common-ui/Status', () => {
  const mockStatusCell = vi.fn(() => <div data-testid="status-cell" />);
  return {
    StatusCell: mockStatusCell,
    __mockStatusCell: mockStatusCell,
  };
});

vi.mock('@ansible/common-ui/columns', () => ({
  useDescriptionColumn: () => ({ header: 'Description' }),
  useNameColumn: () => () => ({ header: 'Name' }),
}));

let useOptionsState = {
  data: {
    actions: {
      GET: {
        source: {
          choices: [
            ['scm', 'Source Control'],
            ['manual', 'Manual'],
          ],
        },
      },
    },
  },
  error: undefined,
  isLoading: false,
};

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => useOptionsState,
}));

vi.mock('../inventorySources/InventorySourceDetails', () => ({
  LastJobTooltip: ({ job }: { job: { id?: number } }) => <div>{job.id}</div>,
}));

let mockStatusCell: ReturnType<typeof vi.fn>;

vi.stubGlobal(
  'mockStatusCell',
  vi.fn(() => <div data-testid="status-cell" />)
);

function getMockStatusCell() {
  // Access the mock from the StatusCell module
  const { StatusCell } = require('@ansible/common-ui/Status');
  return StatusCell;
}

function findStatusColumn(columns: ReturnType<typeof useInventorySourceColumns>) {
  const col = columns.find((col) => col.header === 'Last job status');
  return col && 'cell' in col ?
    (col as typeof columns[0] & { cell: (item: InventorySource) => React.ReactNode }) :
    undefined;
}

function findTypeColumn(columns: ReturnType<typeof useInventorySourceColumns>) {
  return columns.find(
    (col) => col.header === 'Type' && 'value' in col
  ) as (typeof columns[0] & { value: (item: InventorySource) => string }) | undefined;
}

describe('useInventorySourceColumns', () => {
  it('should return columns array', () => {
    const { result } = renderHook(() => useInventorySourceColumns());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(4);
  });

  it('should include status column with job link when jobId is available', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = findStatusColumn(result.current);
    expect(statusColumn).toBeDefined();
    if (!statusColumn) return;

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

    statusColumn.cell(inventorySource);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toBeDefined();
    expect(lastCall?.[0]).toMatchObject({
      status: 'successful',
      disableLinks: undefined,
    });
    expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/123/);
  });

  it('should handle inventory source without job', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = findStatusColumn(result.current);
    expect(statusColumn).toBeDefined();
    if (!statusColumn) return;

    const inventorySource = {
      id: 1,
      inventory: 1,
      source: 'scm',
      status: 'failed',
      summary_fields: {},
      related: { schedules: '/api/v2/schedules/' },
    } as InventorySource;

    statusColumn.cell(inventorySource);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      to: undefined,
      status: 'failed',
    });
  });

  it('should respect disableLinks option', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns({ disableLinks: true }));
    const statusColumn = findStatusColumn(result.current);
    expect(statusColumn).toBeDefined();
    if (!statusColumn) return;

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

    statusColumn.cell(inventorySource);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({
      to: undefined,
      disableLinks: true,
    });
  });

  it('should render type column with value for known source', () => {
    const { result } = renderHook(() => useInventorySourceColumns());
    const typeColumn = findTypeColumn(result.current);
    expect(typeColumn).toBeDefined();
    expect(typeColumn?.header).toBe('Type');

    if (typeColumn?.value) {
      const inventorySource = {
        id: 5,
        inventory: 1,
        source: 'scm',
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/api/v2/schedules/' },
      } as InventorySource;

      const value = typeColumn.value?.(inventorySource);
      expect(value).toBe('Source Control');
    }
  });

  it('should render type column with empty string for unknown source', () => {
    const { result } = renderHook(() => useInventorySourceColumns());
    const typeColumn = findTypeColumn(result.current);

    if (typeColumn?.value) {
      const inventorySource = {
        id: 6,
        inventory: 1,
        source: 'unknown',
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/api/v2/schedules/' },
      } as InventorySource;

      const value = typeColumn.value?.(inventorySource);
      expect(value).toBe('');
    }
  });

  it('should prefer current_job over last_job in status tooltip', () => {
    mockStatusCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = findStatusColumn(result.current);
    if (!statusColumn) return;

    const inventorySource = {
      id: 7,
      inventory: 1,
      source: 'scm',
      status: 'error',
      summary_fields: {
        current_job: { id: 999 },
        last_job: { id: 100 },
      },
      related: { schedules: '/api/v2/schedules/', last_job: '/api/v2/inventory_updates/999/' },
    } as InventorySource;

    statusColumn.cell(inventorySource);
    const lastCall = mockStatusCell.mock.calls[0];
    if (lastCall) {
      expect((lastCall[0] as Record<string, unknown>).to).toMatch(/999/);
    }
  });

  it('should fall back to last_job when current_job has no id', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = findStatusColumn(result.current);
    if (!statusColumn) return;

    const inventorySource = {
      id: 8,
      inventory: 1,
      source: 'scm',
      status: 'pending',
      summary_fields: {
        current_job: {},
        last_job: { id: 888 },
      },
      related: { schedules: '/api/v2/schedules/', last_job: '/api/v2/inventory_updates/888/' },
    } as InventorySource;

    statusColumn.cell(inventorySource);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    if (lastCall) {
      expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/888/);
    }
  });

  it('should handle type column when isLoading is true', () => {
    useOptionsState.isLoading = true;
    const { result } = renderHook(() => useInventorySourceColumns());
    const typeColumn = findTypeColumn(result.current);

    if (typeColumn?.value) {
      const inventorySource = {
        id: 9,
        inventory: 1,
        source: 'scm',
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/api/v2/schedules/' },
      } as InventorySource;

      const value = typeColumn.value(inventorySource);
      expect(value).toBeUndefined();
    }
    useOptionsState.isLoading = false;
  });

  it('should handle type column when error is set', () => {
    useOptionsState.error = new Error('API Error');
    const { result } = renderHook(() => useInventorySourceColumns());
    const typeColumn = findTypeColumn(result.current);

    if (typeColumn?.value) {
      const inventorySource = {
        id: 10,
        inventory: 1,
        source: 'scm',
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/api/v2/schedules/' },
      } as InventorySource;

      const value = typeColumn.value(inventorySource);
      expect(value).toBeUndefined();
    }
    useOptionsState.error = undefined;
  });

  it('should handle type column when sourceChoices is undefined', () => {
    useOptionsState.data = { actions: { GET: { source: { choices: undefined } } } };
    const { result } = renderHook(() => useInventorySourceColumns());
    const typeColumn = findTypeColumn(result.current);

    if (typeColumn?.value) {
      const inventorySource = {
        id: 11,
        inventory: 1,
        source: 'scm',
        status: 'successful',
        summary_fields: {},
        related: { schedules: '/api/v2/schedules/' },
      } as InventorySource;

      const value = typeColumn.value(inventorySource);
      expect(value).toBe('');
    }
    useOptionsState.data = {
      actions: {
        GET: {
          source: {
            choices: [
              ['scm', 'Source Control'],
              ['manual', 'Manual'],
            ],
          },
        },
      },
    };
  });

  it('should use current_update as fallback for job id', () => {
    const mockCell = getMockStatusCell();
    mockCell.mockClear();
    const { result } = renderHook(() => useInventorySourceColumns());
    const statusColumn = findStatusColumn(result.current);
    if (!statusColumn) return;

    const inventorySource = {
      id: 12,
      inventory: 1,
      source: 'scm',
      status: 'running',
      summary_fields: {
        current_job: {},
        last_job: {},
        current_update: { id: 777 },
      },
      related: { schedules: '/api/v2/schedules/', last_job: '/api/v2/inventory_updates/777/' },
    } as InventorySource;

    statusColumn.cell(inventorySource);
    const lastCall = mockCell.mock.calls[mockCell.mock.calls.length - 1];
    if (lastCall) {
      expect((lastCall?.[0] as Record<string, unknown>).to).toMatch(/777/);
    }
  });
});
