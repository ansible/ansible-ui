/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from './PageTableColumn';
import { IPageAction, PageActionSelection, PageActionType } from '../PageActions/PageAction';
import { IFilterState } from '../PageToolbar/PageToolbarFilter';
import { PageTable } from './PageTable';

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

  // Updated toolbarActions to use a Link action with href
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

  it('should render the table with items', () => {
    cy.mount(
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
      />
    );

    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length', mockItems.length);
    cy.contains('Item 1').should('exist');
    cy.contains('Item 2').should('exist');
  });

  it('should render the empty state when there are no items', () => {
    cy.mount(
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
        emptyStateTitle="No items found"
        emptyStateDescription="Please create a new item."
        emptyStateActions={[
          {
            type: PageActionType.Link,
            selection: PageActionSelection.None,
            label: 'Create Item',
            href: '/create-item',
          },
        ]}
        errorStateTitle="Error loading items"
      />
    );

    cy.contains('No items found').should('exist');
    cy.contains('Please create a new item.').should('exist');
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('a').contains('Create Item');
  });

  it('should render the error state when there is an error', () => {
    cy.mount(
      <PageTable<MockItem>
        keyFn={keyFn}
        itemCount={0}
        pageItems={undefined}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        page={1}
        perPage={10}
        setPage={() => {}}
        setPerPage={() => {}}
        filterState={filterState}
        error={new Error('Failed to load data')}
        errorStateTitle="Error loading items"
        emptyStateTitle="No items found"
      />
    );

    cy.contains('Error loading items').should('exist');
    cy.contains('Failed to load data').should('exist');
  });

  it('should handle toolbar actions', () => {
    cy.mount(
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
      />
    );

    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('a').contains('Create Item');
  });

  it('should handle row actions', () => {
    const onEditItem = cy.stub().as('onEditItem');

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

    cy.mount(
      <PageTable<MockItem>
        keyFn={keyFn}
        itemCount={mockItems.length}
        pageItems={mockItems}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={actions}
        page={1}
        perPage={10}
        setPage={() => {}}
        setPerPage={() => {}}
        filterState={filterState}
        emptyStateTitle="No items found"
        errorStateTitle="Error loading items"
      />
    );

    cy.get('[data-cy="row-id-1"] > [data-cy="actions-column-cell"]').within(() => {
      cy.get('[data-cy="actions-dropdown"]').click();
    });
    cy.contains('Edit').click();
    cy.get('@onEditItem').should('have.been.called');
  });
});
