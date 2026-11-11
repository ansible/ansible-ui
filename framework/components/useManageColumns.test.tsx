import type { ReactElement } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnTableOption, type ITableColumn } from '../PageTable/PageTableColumn';
import { useManageColumns } from './useManageColumns';

const setDialog = vi.fn();

vi.mock('../PageDialogs/PageDialog', () => ({
  usePageDialog: () => [undefined, setDialog],
}));

vi.mock('../PageInputs/PageSingleSelect', () => ({
  PageSingleSelect: ({
    onSelect,
    options,
  }: {
    onSelect: (value: string | null) => void;
    options?: { value: string; label: string }[];
  }) => (
    <div>
      {options?.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value === '' ? '' : option.value)}
        >
          pick-{option.value || 'empty'}
        </button>
      ))}
    </div>
  ),
}));

type Row = { id: string; name: string };

const columns: ITableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    type: 'text',
    value: (row) => row.name,
    table: ColumnTableOption.description,
  },
];

describe('useManageColumns', () => {
  beforeEach(() => {
    localStorage.clear();
    setDialog.mockReset();
  });

  it('opens a column management modal with editable cells', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useManageColumns('table-columns', columns));

    act(() => {
      result.current.openColumnManagement();
    });

    const modal = setDialog.mock.calls[0]?.[0] as ReactElement;
    render(modal);

    expect(screen.getByText('Manage Columns')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(localStorage.getItem('table-columns')).toBeTruthy();
  });

  it('exposes table, list, and card editors when no views are disabled', async () => {
    const user = userEvent.setup({ delay: null });
    const { result } = renderHook(() => useManageColumns('all-views', columns));

    act(() => {
      result.current.openColumnManagement();
    });

    const modal = setDialog.mock.calls[0]?.[0] as ReactElement;
    render(modal);

    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();

    for (const optionButton of screen.getAllByRole('button', { name: /^pick-/ })) {
      await user.click(optionButton);
    }

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(localStorage.getItem('all-views')).toBeTruthy();
  });

  it('restores saved column metadata from local storage', () => {
    localStorage.setItem(
      'restored-columns',
      JSON.stringify([
        {
          key: 'name',
          enabled: true,
          state: { table: 'hidden', list: 'subtitle', card: 'description' },
        },
      ])
    );

    const { result } = renderHook(() => useManageColumns('restored-columns', columns));
    expect(result.current.managedColumns[0].table).toBe(ColumnTableOption.hidden);
    expect(result.current.managedColumns[0].list).toBe('subtitle');
    expect(result.current.managedColumns[0].card).toBe('description');
  });

  it('omits list and card editors when those views are disabled', () => {
    const { result } = renderHook(() =>
      useManageColumns('no-list-card', columns, false, true, true)
    );

    act(() => {
      result.current.openColumnManagement();
    });

    const modal = setDialog.mock.calls[0]?.[0] as ReactElement;
    render(modal);

    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.queryByText('List')).not.toBeInTheDocument();
    expect(screen.queryByText('Card')).not.toBeInTheDocument();
  });

  it('ignores non-string role values when loading saved state', () => {
    localStorage.setItem(
      'bad-columns',
      JSON.stringify([
        {
          key: 'name',
          enabled: true,
          state: { table: 42, list: false, card: ['detail'] },
        },
      ])
    );

    const { result } = renderHook(() => useManageColumns('bad-columns', columns));
    expect(result.current.managedColumns[0].table).toBeUndefined();
    expect(result.current.managedColumns[0].list).toBeUndefined();
    expect(result.current.managedColumns[0].card).toBeUndefined();
  });

  it('omits the table column when table view is disabled', () => {
    const { result } = renderHook(() => useManageColumns('no-table', columns, true, false, false));

    act(() => {
      result.current.openColumnManagement();
    });

    const modal = setDialog.mock.calls[0]?.[0] as ReactElement;
    render(modal);

    expect(screen.queryByText('Table')).not.toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });
});
