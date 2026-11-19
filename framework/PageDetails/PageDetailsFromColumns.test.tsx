/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColumnPriority, ITableColumn } from '../PageTable/PageTableColumn';
import { PageDetailsFromColumns } from './PageDetailsFromColumns';

interface Item {
  name: string;
  status: string;
  notes?: string;
}

const baseColumns: ITableColumn<Item>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (item) => item.name,
    value: (item) => item.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (item) => item.status,
    value: (item) => item.status,
    priority: ColumnPriority.last,
    helpText: 'Lifecycle status',
  },
];

describe('PageDetailsFromColumns', () => {
  it('returns null when item is undefined', () => {
    const { container } = render(<PageDetailsFromColumns item={undefined} columns={baseColumns} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when all columns are filtered out', () => {
    const columns: ITableColumn<Item>[] = [
      {
        id: 'notes',
        header: 'Notes',
        cell: (item) => item.notes,
        value: () => '   ',
      },
    ];
    const { container } = render(
      <PageDetailsFromColumns item={{ name: 'x', status: 'ok' }} columns={columns} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders first and last priority columns with children between them', () => {
    render(
      <PageDetailsFromColumns item={{ name: 'Widget', status: 'Active' }} columns={baseColumns}>
        <div data-testid="custom-child">Custom detail</div>
      </PageDetailsFromColumns>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('omits columns with null or undefined values', () => {
    const columns: ITableColumn<Item>[] = [
      {
        id: 'name',
        header: 'Name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
      {
        id: 'notes',
        header: 'Notes',
        cell: (item) => item.notes ?? '',
        value: (item) => item.notes,
      },
    ];

    render(<PageDetailsFromColumns item={{ name: 'Only name', status: 'x' }} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });
});
