/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageTableViewTypeE } from '../PageToolbar/PageTableViewType';
import {
  ColumnCardOption,
  ColumnDashboardOption,
  ColumnListOption,
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TableColumnCell,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useDashboardColumns,
  useDescriptionColumns,
  useExpandedColumns,
  useVisibleCardColumns,
  useVisibleColumns,
  useVisibleListColumns,
  useVisibleModalColumns,
  useVisibleTableColumns,
} from './PageTableColumn';

vi.mock('../PageSettings/PageSettingsProvider', () => ({
  usePageSettings: vi.fn(() => ({ dateFormat: 'date-time' })),
}));

vi.mock('../useFrameworkTranslations', () => ({
  useFrameworkTranslations: () => [{ by: 'by' }],
}));

interface TestItem {
  id: number;
  name: string;
  description: string;
  count: number;
  labels: string[];
  created: string;
}

const testItem: TestItem = {
  id: 1,
  name: 'Test Resource',
  description: 'A test description',
  count: 42,
  labels: ['prod', 'stable'],
  created: '2024-06-15T14:30:00Z',
};

function buildColumns(): ITableColumn<TestItem>[] {
  return [
    {
      header: 'Name',
      type: 'text',
      value: (item) => item.name,
      sort: 'name',
      card: 'name',
      list: 'name',
    },
    {
      header: 'Description',
      type: 'description',
      value: (item) => item.description,
      table: ColumnTableOption.description,
    },
    {
      header: 'Count',
      type: 'count',
      value: (item) => item.count,
    },
    {
      header: 'Labels',
      type: 'labels',
      value: (item) => item.labels,
    },
    {
      header: 'Created',
      type: 'datetime',
      value: (item) => item.created,
      sort: 'created',
    },
    {
      header: 'Custom',
      cell: (item) => <span>{item.name} (custom)</span>,
    },
  ];
}

describe('TableColumnCell', () => {
  const renderCell = (column: ITableColumn<TestItem> | undefined) =>
    render(
      <MemoryRouter>
        <TableColumnCell item={testItem} column={column} />
      </MemoryRouter>
    );

  it('should render column.cell(item) for default type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Custom',
      cell: (item) => <span>{item.name} (custom)</span>,
    };

    renderCell(column);

    expect(screen.getByText('Test Resource (custom)')).toBeInTheDocument();
  });

  it('should render TextCell for text type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Name',
      type: 'text',
      value: (item) => item.name,
    };

    renderCell(column);

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });

  it('should render TextCell with link for text type with to', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Name',
      type: 'text',
      value: (item) => item.name,
      to: () => '/resources/1',
    };

    renderCell(column);

    const link = screen.getByRole('link', { name: 'Test Resource' });
    expect(link).toHaveAttribute('href', '/resources/1');
  });

  it('should render description div for description type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Description',
      type: 'description',
      value: (item) => item.description,
    };

    renderCell(column);

    const element = screen.getByText('A test description');
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveStyle({ minWidth: '200px', whiteSpace: 'normal' });
  });

  it('should render DateTimeCell for datetime type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Created',
      type: 'datetime',
      value: (item) => item.created,
    };

    const { container } = renderCell(column);

    expect(container.querySelector('.date-time')).toBeInTheDocument();
  });

  it('should render count value for count type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Count',
      type: 'count',
      value: (item) => item.count,
    };

    renderCell(column);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render dash when count value is undefined', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Count',
      type: 'count',
      value: () => undefined,
    };

    renderCell(column);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should render LabelsCell for labels type', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Labels',
      type: 'labels',
      value: (item) => item.labels,
    };

    renderCell(column);

    expect(screen.getByText('prod')).toBeInTheDocument();
    expect(screen.getByText('stable')).toBeInTheDocument();
  });

  it('should render LabelsCell with rich LabelValue objects', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Labels',
      type: 'labels',
      value: () => [
        { label: 'published', color: 'blue', variant: 'filled' },
        { label: 'Signed', status: 'success', variant: 'outline' },
      ],
    };

    renderCell(column);

    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('should render LabelsCell with empty array when labels value is undefined', () => {
    const column: ITableColumn<TestItem> = {
      header: 'Labels',
      type: 'labels',
      value: () => undefined,
    };

    const { container } = renderCell(column);

    expect(container.querySelector('.pf-v6-c-label')).not.toBeInTheDocument();
  });

  it('should render empty fragment when column is undefined', () => {
    const { container } = renderCell(undefined);

    expect(container.textContent).toBe('');
  });
});

describe('useVisibleTableColumns', () => {
  it('should filter out hidden columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], table: ColumnTableOption.hidden };

    const { result } = renderHook(() => useVisibleTableColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should filter out description columns', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleTableColumns(columns));

    expect(result.current.find((c) => c.header === 'Description')).toBeUndefined();
  });

  it('should filter out expanded columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], table: ColumnTableOption.expanded };

    const { result } = renderHook(() => useVisibleTableColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should keep columns without table option', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleTableColumns(columns));

    expect(result.current.find((c) => c.header === 'Name')).toBeDefined();
    expect(result.current.find((c) => c.header === 'Custom')).toBeDefined();
  });
});

describe('useVisibleListColumns', () => {
  it('should filter out list-hidden columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], list: ColumnListOption.hidden };

    const { result } = renderHook(() => useVisibleListColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should keep columns without list option', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleListColumns(columns));

    expect(result.current.find((c) => c.header === 'Created')).toBeDefined();
  });

  it('should keep columns with non-hidden list options', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], list: ColumnListOption.primary };

    const { result } = renderHook(() => useVisibleListColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeDefined();
  });
});

describe('useVisibleCardColumns', () => {
  it('should filter out card-hidden columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], card: ColumnCardOption.hidden };

    const { result } = renderHook(() => useVisibleCardColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should keep columns without card option', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleCardColumns(columns));

    expect(result.current.find((c) => c.header === 'Labels')).toBeDefined();
  });
});

describe('useVisibleModalColumns', () => {
  it('should filter out modal-hidden columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], modal: ColumnModalOption.hidden };

    const { result } = renderHook(() => useVisibleModalColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should keep columns without modal option', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleModalColumns(columns));

    expect(result.current.length).toBe(columns.length);
  });
});

describe('useDescriptionColumns', () => {
  it('should return only description columns', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useDescriptionColumns(columns));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].header).toBe('Description');
  });

  it('should not include hidden columns', () => {
    const columns = buildColumns();
    columns[1] = { ...columns[1], table: ColumnTableOption.hidden };

    const { result } = renderHook(() => useDescriptionColumns(columns));

    expect(result.current).toHaveLength(0);
  });

  it('should return empty array when no description columns exist', () => {
    const columns = buildColumns().filter((c) => c.header !== 'Description');

    const { result } = renderHook(() => useDescriptionColumns(columns));

    expect(result.current).toHaveLength(0);
  });
});

describe('useExpandedColumns', () => {
  it('should return only expanded columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], table: ColumnTableOption.expanded };

    const { result } = renderHook(() => useExpandedColumns(columns));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].header).toBe('Count');
  });

  it('should not include hidden columns', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useExpandedColumns(columns));

    expect(result.current.find((c) => c.table === ColumnTableOption.hidden)).toBeUndefined();
  });

  it('should return empty array when no expanded columns exist', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useExpandedColumns(columns));

    expect(result.current).toHaveLength(0);
  });
});

describe('useColumnsWithoutSort', () => {
  it('should remove sort from all columns', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useColumnsWithoutSort(columns));

    result.current.forEach((col) => {
      expect(col.sort).toBeUndefined();
    });
  });

  it('should preserve other column properties', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useColumnsWithoutSort(columns));

    expect(result.current[0].header).toBe('Name');
    expect(result.current.length).toBe(columns.length);
  });
});

describe('useColumnsWithoutExpandedRow', () => {
  it('should clear expanded table option', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], table: ColumnTableOption.expanded };

    const { result } = renderHook(() => useColumnsWithoutExpandedRow(columns));

    expect(result.current[2].table).toBeUndefined();
  });

  it('should preserve non-expanded table options', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useColumnsWithoutExpandedRow(columns));

    const descCol = result.current.find((c) => c.header === 'Description');
    expect(descCol?.table).toBe(ColumnTableOption.description);
  });
});

describe('useDashboardColumns', () => {
  it('should filter out dashboard-hidden columns', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], dashboard: ColumnDashboardOption.hidden };

    const { result } = renderHook(() => useDashboardColumns(columns));

    expect(result.current.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should remove sort from all columns', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useDashboardColumns(columns));

    result.current.forEach((col) => {
      expect(col.sort).toBeUndefined();
    });
  });

  it('should clear expanded table option', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], table: ColumnTableOption.expanded };

    const { result } = renderHook(() => useDashboardColumns(columns));

    const countCol = result.current.find((c) => c.header === 'Count');
    expect(countCol?.table).toBeUndefined();
  });
});

describe('useVisibleColumns', () => {
  it('should return table-visible columns for Table view', () => {
    const columns = buildColumns();

    const { result } = renderHook(() => useVisibleColumns(columns, PageTableViewTypeE.Table));

    expect(result.current?.find((c) => c.header === 'Description')).toBeUndefined();
    expect(result.current?.find((c) => c.header === 'Name')).toBeDefined();
  });

  it('should return list-visible columns for List view', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], list: ColumnListOption.hidden };

    const { result } = renderHook(() => useVisibleColumns(columns, PageTableViewTypeE.List));

    expect(result.current?.find((c) => c.header === 'Count')).toBeUndefined();
  });

  it('should return card-visible columns for Cards view', () => {
    const columns = buildColumns();
    columns[2] = { ...columns[2], card: ColumnCardOption.hidden };

    const { result } = renderHook(() => useVisibleColumns(columns, PageTableViewTypeE.Cards));

    expect(result.current?.find((c) => c.header === 'Count')).toBeUndefined();
  });
});
