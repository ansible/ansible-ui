/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ITableColumn } from '../PageTable/PageTableColumn';
import {
  PageToolbarSort,
  PageTableSortOption,
  usePageToolbarSortOptionsFromColumns,
} from './PageToolbarSort';

describe('PageToolbarSort', () => {
  it('should render nothing when no sortOptions', () => {
    const { container } = render(<PageToolbarSort />);
    expect(container.innerHTML).toBe('');
  });

  it('should render sort label and select with options', () => {
    const sortOptions: PageTableSortOption[] = [
      { label: 'Name', value: 'name', type: 'text' },
      { label: 'Created', value: 'created', type: 'number' },
    ];

    render(
      <PageToolbarSort
        sort="name"
        setSort={vi.fn()}
        sortDirection="asc"
        setSortDirection={vi.fn()}
        sortOptions={sortOptions}
      />
    );

    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should toggle direction when direction button clicked', async () => {
    const user = userEvent.setup();
    const setSortDirection = vi.fn();
    const sortOptions: PageTableSortOption[] = [{ label: 'Name', value: 'name', type: 'text' }];

    render(
      <PageToolbarSort
        sort="name"
        setSort={vi.fn()}
        sortDirection="asc"
        setSortDirection={setSortDirection}
        sortOptions={sortOptions}
      />
    );

    const buttons = screen.getAllByRole('button');
    const directionButton = buttons[buttons.length - 1];
    await user.click(directionButton);

    expect(setSortDirection).toHaveBeenCalledWith('desc');
  });
});

describe('usePageToolbarSortOptionsFromColumns', () => {
  it('should map columns with sort to sort options', () => {
    type TestItem = { id: number; name: string; count: number; desc: string };

    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        sort: 'name',
        defaultSort: true,
        type: 'text',
        value: (item) => item.name,
      },
      {
        header: 'Count',
        sort: 'count',
        type: 'count',
        value: (item) => item.count,
      },
      {
        header: 'Description',
        sort: 'description',
        type: 'text',
        value: (item) => item.desc,
      },
      {
        header: 'Other',
        sort: 'other',
        type: 'datetime',
        value: () => undefined,
      },
    ];

    const { result } = renderHook(() => usePageToolbarSortOptionsFromColumns(columns));

    expect(result.current).toHaveLength(4);
    expect(result.current[0]).toEqual(
      expect.objectContaining({ label: 'Name', value: 'name', type: 'text' })
    );
    expect(result.current[1]).toEqual(
      expect.objectContaining({ label: 'Count', value: 'count', type: 'number' })
    );
    expect(result.current[2]).toEqual(
      expect.objectContaining({ label: 'Description', value: 'description', type: 'text' })
    );
    expect(result.current[3]).toEqual(expect.objectContaining({ label: 'Other', value: 'other' }));
    expect(result.current[3].type).toBeUndefined();
  });
});
