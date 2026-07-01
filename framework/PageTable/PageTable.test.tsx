/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionSelection, PageActionType } from '../PageActions/PageAction';
import { IFilterState } from '../PageToolbar/PageToolbarFilter';
import { PageTable, PageTableProps } from './PageTable';
import { ITableColumn } from './PageTableColumn';

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
});
