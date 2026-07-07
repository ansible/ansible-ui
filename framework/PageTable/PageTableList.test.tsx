/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageActionSelection, PageActionType } from '../PageActions/PageAction';
import { ITableColumn } from './PageTableColumn';
import { PageTableList } from './PageTableList';

interface TestItem {
  id: number;
  name: string;
  description: string;
}

const keyFn = (item: TestItem) => item.id;

const testItems: TestItem[] = [
  { id: 1, name: 'Item One', description: 'First item' },
  { id: 2, name: 'Item Two', description: 'Second item' },
];

const baseColumns: ITableColumn<TestItem>[] = [
  {
    header: 'Name',
    list: 'name',
    cell: (item) => item.name,
  },
  {
    header: 'Description',
    type: 'description',
    value: (item) => item.description,
  },
];

const baseProps = {
  keyFn,
  tableColumns: baseColumns,
  page: 1,
  perPage: 10,
  setPage: vi.fn(),
  setPerPage: vi.fn(),
  emptyStateTitle: 'No items',
  errorStateTitle: 'Error',
  filterState: {},
};

describe('PageTableList', () => {
  it('should render DataList items for pageItems', () => {
    render(
      <MemoryRouter>
        <PageTableList {...baseProps} pageItems={testItems} itemCount={2} />
      </MemoryRouter>
    );

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
  });

  it('should show empty state when itemCount is 0', () => {
    render(
      <MemoryRouter>
        <PageTableList {...baseProps} pageItems={[]} itemCount={0} clearAllFilters={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should render checkbox when showSelect is true', () => {
    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          pageItems={testItems}
          itemCount={2}
          showSelect
          isSelected={() => false}
          selectItem={vi.fn()}
          unselectItem={vi.fn()}
        />
      </MemoryRouter>
    );

    const checkboxes = document.querySelectorAll('[data-testid="data-list-check"]');
    expect(checkboxes.length).toBe(2);
  });

  it('should render row actions', () => {
    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          pageItems={testItems}
          itemCount={2}
          rowActions={[
            {
              type: PageActionType.Button,
              selection: PageActionSelection.Single,
              label: 'Edit',
              onClick: vi.fn(),
            },
          ]}
        />
      </MemoryRouter>
    );

    const actionCells = document.querySelectorAll('[data-testid="data-list-action"]');
    expect(actionCells.length).toBe(2);
  });

  it('should render description column content', () => {
    render(
      <MemoryRouter>
        <PageTableList {...baseProps} pageItems={testItems} itemCount={2} />
      </MemoryRouter>
    );

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
  });

  it('should use defaultSubtitle when no subtitle column', () => {
    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          pageItems={testItems}
          itemCount={2}
          defaultSubtitle="Resource"
        />
      </MemoryRouter>
    );

    const subtitles = screen.getAllByText('Resource');
    expect(subtitles).toHaveLength(2);
  });

  it('should render secondary columns', () => {
    const columnsWithSecondary: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'ID',
        list: 'secondary',
        cell: (item) => `#${item.id}`,
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithSecondary}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    const idHeaders = screen.getAllByText('ID');
    expect(idHeaders).toHaveLength(2);
  });

  it('should render count columns', () => {
    const columnsWithCount: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Members',
        type: 'count',
        value: () => 42,
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithCount}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    const memberHeaders = screen.getAllByText('Members');
    expect(memberHeaders.length).toBeGreaterThan(0);
  });

  it('should skip columns with falsy value', () => {
    const columnsWithFalsy: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Optional',
        cell: () => null,
        value: () => undefined,
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithFalsy}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Item One')).toBeInTheDocument();
  });

  it('should hide list-hidden columns', () => {
    const columnsWithHidden: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Hidden Column',
        list: 'hidden',
        cell: () => 'should not appear',
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithHidden}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
  });

  it('should render labels column', () => {
    const columnsWithLabels: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Tags',
        type: 'labels',
        value: () => ['production', 'active'],
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithLabels}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByText('production').length).toBeGreaterThan(0);
    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
  });

  it('should skip primary column when value() returns falsy', () => {
    const columnsWithFalsyPrimary: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        list: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Optional Field',
        cell: () => 'should not render',
        value: () => undefined,
      },
    ];

    render(
      <MemoryRouter>
        <PageTableList
          {...baseProps}
          tableColumns={columnsWithFalsyPrimary}
          pageItems={testItems}
          itemCount={2}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.queryByText('Optional Field')).not.toBeInTheDocument();
    expect(screen.queryByText('should not render')).not.toBeInTheDocument();
  });
});
