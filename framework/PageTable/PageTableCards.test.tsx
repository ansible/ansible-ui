/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ITableColumn } from './PageTableColumn';
import { PageTableCards } from './PageTableCards';

interface MockItem {
  id: number;
  name: string;
}

const tableColumns: ITableColumn<MockItem>[] = [
  {
    header: 'Name',
    cell: (item) => item.name,
    card: 'name',
  },
];

const keyFn = (item: MockItem) => item.id;

describe('PageTableCards', () => {
  it('should render cards for items', () => {
    const items: MockItem[] = [
      { id: 1, name: 'Card One' },
      { id: 2, name: 'Card Two' },
    ];

    render(
      <MemoryRouter>
        <PageTableCards
          keyFn={keyFn}
          pageItems={items}
          tableColumns={tableColumns}
          itemCount={2}
          page={1}
          perPage={10}
          setPage={vi.fn()}
          setPerPage={vi.fn()}
          clearAllFilters={vi.fn()}
          errorStateTitle="Error"
          emptyStateTitle="No items"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Card One')).toBeInTheDocument();
    expect(screen.getByText('Card Two')).toBeInTheDocument();
  });

  it('should show empty state when itemCount is 0', () => {
    render(
      <MemoryRouter>
        <PageTableCards
          keyFn={keyFn}
          pageItems={[]}
          tableColumns={tableColumns}
          itemCount={0}
          page={1}
          perPage={10}
          setPage={vi.fn()}
          setPerPage={vi.fn()}
          clearAllFilters={vi.fn()}
          errorStateTitle="Error"
          emptyStateTitle="No items"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /no results found/i })).toBeInTheDocument();
  });
});
