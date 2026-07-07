/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { ITableColumn } from './PageTableColumn';
import { PageMultiSelectList, PageMultiSelectListProps } from './PageMultiSelectList';

vi.mock('./PageTable', () => ({
  PageTable: (props: Record<string, unknown>) => (
    <div data-testid="mock-page-table" data-show-select={props.showSelect} />
  ),
}));

interface TestItem {
  id: number;
  name: string;
}

const testColumns: ITableColumn<TestItem>[] = [
  {
    header: 'Name',
    card: 'name',
    cell: (item) => item.name,
    value: (item) => item.name,
  },
];

const testFilters: IToolbarFilter[] = [];

function buildView(
  overrides: Partial<PageMultiSelectListProps<TestItem>['view']> = {}
): PageMultiSelectListProps<TestItem>['view'] {
  return {
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'name',
    setSort: vi.fn(),
    sortDirection: 'asc' as const,
    setSortDirection: vi.fn(),
    filterState: {},
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    selectedItems: [],
    selectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectItem: vi.fn(),
    unselectItems: vi.fn(),
    isSelected: vi.fn(() => false),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    keyFn: (item: TestItem) => item.id,
    pageItems: [],
    itemCount: 0,
    ...overrides,
  };
}

describe('PageMultiSelectList', () => {
  it('should show Skeleton when loading', () => {
    const view = buildView({ itemCount: undefined, error: undefined });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    const skeleton = document.querySelector('.pf-v6-c-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should show "none selected" text when no items selected', () => {
    const view = buildView({ selectedItems: [], itemCount: 5 });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    expect(screen.getByText('None - Please make a selection below.')).toBeInTheDocument();
  });

  it('should show selected item labels', () => {
    const items: TestItem[] = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ];
    const view = buildView({ selectedItems: items, itemCount: 5 });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should call unselectItem when label close button is clicked', async () => {
    const user = userEvent.setup();
    const unselectItem = vi.fn();
    const items: TestItem[] = [{ id: 1, name: 'Alpha' }];
    const view = buildView({ selectedItems: items, itemCount: 5, unselectItem });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(unselectItem).toHaveBeenCalledWith(items[0]);
  });

  it('should use labelForSelectedItems prop when provided', () => {
    const view = buildView({ selectedItems: [], itemCount: 5 });
    render(
      <MemoryRouter>
        <PageMultiSelectList
          view={view}
          tableColumns={testColumns}
          toolbarFilters={testFilters}
          labelForSelectedItems="Chosen items"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Chosen items')).toBeInTheDocument();
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });

  it('should show default "Selected" label when labelForSelectedItems is not provided', () => {
    const view = buildView({ selectedItems: [], itemCount: 5 });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('should render PageTable', () => {
    const view = buildView({
      itemCount: 2,
      pageItems: [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ],
    });
    render(
      <MemoryRouter>
        <PageMultiSelectList view={view} tableColumns={testColumns} toolbarFilters={testFilters} />
      </MemoryRouter>
    );

    const table = screen.getByTestId('mock-page-table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute('data-show-select', 'true');
  });
});
