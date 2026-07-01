/* eslint-disable i18next/no-literal-string */
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionSelection, PageActionType } from '../PageActions/PageAction';
import { IFilterState } from '../PageToolbar/PageToolbarFilter';
import { PageTable, PageTableProps } from './PageTable';
import { ColumnTableOption, ITableColumn } from './PageTableColumn';

describe('PageTable Component', () => {
  interface MockItem {
    id: number;
    name: string;
    description: string;
  }

  const mockItems: MockItem[] = [
    { id: 1, name: 'Item 1', description: 'First item description' },
    { id: 2, name: 'Item 2', description: 'Second item description' },
  ];

  const keyFn = (item: MockItem) => item.id;

  const tableColumns: ITableColumn<MockItem>[] = [
    {
      header: 'Name',
      cell: (item) => item.name,
    },
    {
      header: 'Description',
      cell: (item) => item.description,
    },
  ];

  const toolbarActions: IPageAction<MockItem>[] = [
    {
      type: PageActionType.Link,
      selection: PageActionSelection.None,
      label: 'Create Item',
      href: '/create-item',
    },
  ];

  const rowActions: IPageAction<MockItem>[] = [
    {
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      label: 'Edit',
      onClick: () => {},
    },
  ];

  const filterState: IFilterState = {};

  // Base props without emptyState discriminated union fields
  type BaseTestProps = Omit<
    PageTableProps<MockItem>,
    | 'emptyState'
    | 'emptyStateTitle'
    | 'emptyStateDescription'
    | 'emptyStateIcon'
    | 'emptyStateNoDataIcon'
    | 'emptyStateActions'
    | 'emptyStateButtonIcon'
    | 'emptyStateButtonText'
    | 'emptyStateButtonClick'
    | 'emptyStateVariant'
  >;

  const renderPageTable = (
    props?: Partial<BaseTestProps> & {
      emptyStateDescription?: string;
      emptyStateActions?: IPageAction<MockItem>[];
      emptyStateButtonText?: string;
      emptyStateButtonClick?: () => void;
    }
  ) => {
    return render(
      <MemoryRouter>
        <PageTable<MockItem>
          keyFn={keyFn}
          itemCount={mockItems.length}
          pageItems={mockItems}
          tableColumns={tableColumns}
          toolbarActions={toolbarActions}
          rowActions={rowActions}
          page={1}
          perPage={10}
          setPage={() => {}}
          setPerPage={() => {}}
          filterState={filterState}
          emptyStateTitle="No items found"
          errorStateTitle="Error loading items"
          {...props}
        />
      </MemoryRouter>
    );
  };

  it('should render the table with items', () => {
    renderPageTable();

    // Verify items are rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('First item description')).toBeInTheDocument();
    expect(screen.getByText('Second item description')).toBeInTheDocument();
  });

  it('should render the empty state when there are no items', () => {
    renderPageTable({
      itemCount: 0,
      pageItems: [],
      emptyStateDescription: 'Please create a new item.',
      emptyStateActions: [
        {
          type: PageActionType.Link,
          selection: PageActionSelection.None,
          label: 'Create Item',
          href: '/create-item',
        },
      ],
    });

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Please create a new item.')).toBeInTheDocument();
  });

  it('should render the error state when there is an error', () => {
    renderPageTable({
      itemCount: 0,
      pageItems: undefined,
      error: new Error('Failed to load data'),
    });

    expect(screen.getByText('Error loading items')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should render row action buttons', () => {
    const onEditItem = vi.fn();

    const actions: IPageAction<MockItem>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: 'Edit',
        onClick: (item: MockItem): void => {
          onEditItem(item);
        },
      },
    ];

    renderPageTable({
      rowActions: actions,
    });

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render loading state when pageItems is undefined', () => {
    renderPageTable({
      pageItems: undefined,
      itemCount: undefined,
    });

    const skeletons = document.querySelectorAll('.pf-v6-c-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render filtered empty state when itemCount is 0 with active filters', () => {
    renderPageTable({
      itemCount: 0,
      pageItems: [],
      filterState: { name: ['test'] },
    });

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('No results match this filter criteria. Clear all filters and try again.')
    ).toBeInTheDocument();
  });

  it('should render custom emptyState when provided', () => {
    render(
      <MemoryRouter>
        <PageTable<MockItem>
          keyFn={keyFn}
          itemCount={0}
          pageItems={[]}
          tableColumns={tableColumns}
          toolbarActions={toolbarActions}
          rowActions={rowActions}
          page={1}
          perPage={10}
          setPage={() => {}}
          setPerPage={() => {}}
          filterState={{}}
          emptyState={<div>Custom empty state</div>}
          errorStateTitle="Error"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Custom empty state')).toBeInTheDocument();
  });

  it('should render emptyStateButtonClick button', () => {
    const onClick = vi.fn();

    renderPageTable({
      itemCount: 0,
      pageItems: [],
      emptyStateButtonText: 'Create New',
      emptyStateButtonClick: onClick,
    });

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
  });

  it('should derive showSelect from Multiple toolbar action', () => {
    const bulkActions: IPageAction<MockItem>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        label: 'Delete',
        onClick: () => {},
      },
    ];

    renderPageTable({
      toolbarActions: bulkActions,
      isSelected: () => false,
      selectedItems: [],
      selectItem: () => {},
      unselectItem: () => {},
    });

    const checkboxHeaders = document.querySelectorAll('[data-testid="selections-column-header"]');
    expect(checkboxHeaders.length).toBeGreaterThan(0);
  });

  it('should hide pagination when autoHidePagination and items fit in one page', () => {
    const { container } = renderPageTable({
      autoHidePagination: true,
      itemCount: 2,
      perPage: 10,
    });

    const pagination = container.querySelector('.pf-v6-c-pagination');
    expect(pagination).not.toBeInTheDocument();
  });

  it('should show pagination when autoHidePagination but items exceed perPage', () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description ${i + 1}`,
    }));

    renderPageTable({
      autoHidePagination: true,
      itemCount: 15,
      pageItems: manyItems,
      perPage: 10,
    });

    const pagination = document.querySelector('.pf-v6-c-pagination');
    expect(pagination).toBeInTheDocument();
  });

  it('should hide pagination when disablePagination is true', () => {
    const { container } = renderPageTable({
      disablePagination: true,
    });

    const pagination = container.querySelector('.pf-v6-c-pagination');
    expect(pagination).not.toBeInTheDocument();
  });

  it('should render selection checkbox column when showSelect is true', () => {
    renderPageTable({
      showSelect: true,
      isSelected: () => false,
      selectedItems: [],
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
    });

    expect(screen.getByTestId('selections-column-header')).toBeInTheDocument();
    const checkboxCells = screen.getAllByTestId('checkbox-column-cell');
    expect(checkboxCells).toHaveLength(mockItems.length);
  });

  it('should call selectItems when header select-all checkbox is clicked', async () => {
    const user = userEvent.setup();
    const selectItems = vi.fn();

    renderPageTable({
      showSelect: true,
      isSelected: () => false,
      selectedItems: [],
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
      selectItems,
      unselectAll: vi.fn(),
    });

    const headerCheckbox = within(screen.getByTestId('selections-column-header')).getByRole(
      'checkbox'
    );
    await user.click(headerCheckbox);

    expect(selectItems).toHaveBeenCalledWith(mockItems);
  });

  it('should call unselectAll when header checkbox is clicked while all selected', async () => {
    const user = userEvent.setup();
    const unselectAll = vi.fn();

    renderPageTable({
      showSelect: true,
      isSelected: () => true,
      selectedItems: [...mockItems],
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
      selectItems: vi.fn(),
      unselectAll,
    });

    const headerCheckbox = within(screen.getByTestId('selections-column-header')).getByRole(
      'checkbox'
    );
    await user.click(headerCheckbox);

    expect(unselectAll).toHaveBeenCalled();
  });

  it('should render expand toggle for description columns and reveal content on click', async () => {
    const user = userEvent.setup();
    const columnsWithDescription: ITableColumn<MockItem>[] = [
      {
        header: 'Name',
        cell: (item) => item.name,
      },
      {
        header: 'Details',
        cell: (item) => item.description,
        table: ColumnTableOption.description,
        value: (item) => item.description,
      },
    ];

    renderPageTable({
      tableColumns: columnsWithDescription,
    });

    const expandCells = screen.getAllByTestId('expand-column-cell');
    expect(expandCells).toHaveLength(mockItems.length);

    const firstExpandButton = within(expandCells[0]).getByRole('button');
    await user.click(firstExpandButton);

    expect(screen.getByText('First item description')).toBeInTheDocument();
  });

  it('should call onSelect when a row is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderPageTable({
      onSelect,
      isSelected: () => false,
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
    });

    await user.click(screen.getByTestId('row-id-1'));

    expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should call unselectAll before selecting when isSelectMultiple is false', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const unselectAll = vi.fn();
    const selectItem = vi.fn();

    renderPageTable({
      onSelect,
      isSelectMultiple: false,
      isSelected: () => false,
      selectItem,
      unselectItem: vi.fn(),
      unselectAll,
    });

    await user.click(screen.getByTestId('row-id-1'));

    expect(unselectAll).toHaveBeenCalled();
    expect(selectItem).toHaveBeenCalledWith(mockItems[0]);
    expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should unselectItem when clicking a selected row in multi-select mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const unselectItem = vi.fn();

    renderPageTable({
      onSelect,
      isSelectMultiple: true,
      isSelected: (item) => item.id === 1,
      selectItem: vi.fn(),
      unselectItem,
    });

    await user.click(screen.getByTestId('row-id-1'));

    expect(unselectItem).toHaveBeenCalledWith(mockItems[0]);
    expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should disable unchecked row checkboxes when maxSelections is reached', () => {
    renderPageTable({
      showSelect: true,
      maxSelections: 1,
      isSelected: (item) => item.id === 1,
      selectedItems: [mockItems[0]],
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
    });

    const checkboxCells = screen.getAllByTestId('checkbox-column-cell');
    const firstCheckbox = within(checkboxCells[0]).getByRole('checkbox');
    const secondCheckbox = within(checkboxCells[1]).getByRole('checkbox');

    expect(firstCheckbox).not.toBeDisabled();
    expect(secondCheckbox).toBeDisabled();
  });

  it('should render sort headers for columns with sort property', () => {
    const sortableColumns: ITableColumn<MockItem>[] = [
      {
        header: 'Name',
        cell: (item) => item.name,
        sort: 'name',
      },
      {
        header: 'Description',
        cell: (item) => item.description,
      },
    ];

    const setSort = vi.fn();
    const setSortDirection = vi.fn();

    renderPageTable({
      tableColumns: sortableColumns,
      sort: 'name',
      setSort,
      sortDirection: 'asc',
      setSortDirection,
    });

    const nameHeader = screen.getByTestId('name-column-header');
    const sortButton = within(nameHeader).getByRole('button');
    expect(sortButton).toBeInTheDocument();
  });

  it('should call setSort and setSortDirection when a sort header is clicked', async () => {
    const user = userEvent.setup();
    const sortableColumns: ITableColumn<MockItem>[] = [
      {
        header: 'Name',
        cell: (item) => item.name,
        sort: 'name',
      },
    ];

    const setSort = vi.fn();
    const setSortDirection = vi.fn();

    renderPageTable({
      tableColumns: sortableColumns,
      sort: 'name',
      setSort,
      sortDirection: 'asc',
      setSortDirection,
    });

    const nameHeader = screen.getByTestId('name-column-header');
    const sortButton = within(nameHeader).getByRole('button');
    await user.click(sortButton);

    expect(setSort).toHaveBeenCalledWith('name');
    expect(setSortDirection).toHaveBeenCalled();
  });

  it('should render table with compact variant when compact is true', () => {
    renderPageTable({ compact: true });

    const table = document.querySelector('table.pf-v6-c-table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('pf-m-compact');
  });

  it('should render list view when disableTableView is true', () => {
    renderPageTable({ disableTableView: true });

    const dataList = document.querySelector('[class*="pf-v6-c-data-list"]');
    expect(dataList).toBeInTheDocument();
    expect(document.querySelector('table.pf-v6-c-table')).not.toBeInTheDocument();
  });

  it('should render card view when both table and list views are disabled', () => {
    renderPageTable({ disableTableView: true, disableListView: true });

    expect(document.querySelector('table.pf-v6-c-table')).not.toBeInTheDocument();
    expect(document.querySelector('[class*="pf-v6-c-data-list"]')).not.toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render row action cells when rowActions are provided', () => {
    renderPageTable();

    const actionCells = screen.getAllByTestId('actions-column-cell');
    expect(actionCells).toHaveLength(mockItems.length);
    expect(screen.getByTestId('action-column-header')).toBeInTheDocument();
  });

  it('should render column header cells with correct data-testid', () => {
    renderPageTable();

    expect(screen.getByTestId('name-column-header')).toBeInTheDocument();
    expect(screen.getByTestId('description-column-header')).toBeInTheDocument();
  });

  it('should render column data cells with correct data-testid', () => {
    renderPageTable();

    const nameCells = screen.getAllByTestId('name-column-cell');
    expect(nameCells).toHaveLength(mockItems.length);
    const descCells = screen.getAllByTestId('description-column-cell');
    expect(descCells).toHaveLength(mockItems.length);
  });

  it('should call selectItem when a row checkbox is checked', async () => {
    const user = userEvent.setup();
    const selectItem = vi.fn();

    renderPageTable({
      showSelect: true,
      isSelected: () => false,
      selectedItems: [],
      selectItem,
      unselectItem: vi.fn(),
    });

    const checkboxCells = screen.getAllByTestId('checkbox-column-cell');
    const firstCheckbox = within(checkboxCells[0]).getByRole('checkbox');
    await user.click(firstCheckbox);

    expect(selectItem).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should call unselectItem when a selected row checkbox is unchecked', async () => {
    const user = userEvent.setup();
    const unselectItem = vi.fn();

    renderPageTable({
      showSelect: true,
      isSelected: (item) => item.id === 1,
      selectedItems: [mockItems[0]],
      selectItem: vi.fn(),
      unselectItem,
    });

    const checkboxCells = screen.getAllByTestId('checkbox-column-cell');
    const firstCheckbox = within(checkboxCells[0]).getByRole('checkbox');
    await user.click(firstCheckbox);

    expect(unselectItem).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should render expanded row with custom expandedRow function', async () => {
    const user = userEvent.setup();

    renderPageTable({
      expandedRow: (item) => <div>Expanded: {item.name}</div>,
    });

    const expandCells = screen.getAllByTestId('expand-column-cell');
    const firstExpandButton = within(expandCells[0]).getByRole('button');
    await user.click(firstExpandButton);

    expect(screen.getByText('Expanded: Item 1')).toBeInTheDocument();
  });

  it('should render onSelect radio buttons when isSelectMultiple is false', () => {
    renderPageTable({
      onSelect: vi.fn(),
      isSelectMultiple: false,
      isSelected: () => false,
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
    });

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(mockItems.length);
  });
});
