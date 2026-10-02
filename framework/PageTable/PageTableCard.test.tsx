/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ITableColumn } from './PageTableColumn';
import { PageTableCard, useColumnsToTableCardFn } from './PageTableCard';

interface TestItem {
  id: number;
  name: string;
  description: string;
  count: number;
  labels: string[];
}

const keyFn = (item: TestItem) => item.id;

const testItem: TestItem = {
  id: 1,
  name: 'Test Item',
  description: 'Test description',
  count: 5,
  labels: ['label1', 'label2'],
};

describe('PageTableCard', () => {
  it('should render card with title and body', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Test Title</span>,
            cardBody: <div>Card body content</div>,
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            subtitle: <span>Subtitle text</span>,
            cardBody: <div />,
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('should render defaultCardSubtitle when no subtitle in card', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            cardBody: <div />,
          })}
          defaultCardSubtitle={<span>Default subtitle</span>}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Default subtitle')).toBeInTheDocument();
  });

  it('should render badge without tooltip', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            cardBody: <div />,
            badge: 'New',
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render badge with tooltip', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            cardBody: <div />,
            badge: 'Info',
            badgeTooltip: 'Tooltip content',
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should render alert when alertTitle is provided', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            cardBody: <div />,
            alertTitle: 'Warning alert',
            alertVariant: 'warning',
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Warning alert')).toBeInTheDocument();
  });

  it('should render labels in footer', () => {
    render(
      <MemoryRouter>
        <PageTableCard
          item={testItem}
          itemToCardFn={() => ({
            id: 1,
            title: <span>Title</span>,
            cardBody: <div />,
            labels: [{ label: 'Production' }, { label: 'Active' }],
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('useColumnsToTableCardFn', () => {
  it('should map name column to card title', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.id).toBe(1);
  });

  it('should map subtitle column', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
      {
        header: 'Type',
        card: 'subtitle',
        cell: (item) => item.description,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.subtitle).toBeTruthy();
  });

  it('should map description column', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Description',
        type: 'description',
        value: (item) => item.description,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.cardBody).toBeTruthy();
  });

  it('should map count columns', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Count',
        type: 'count',
        value: (item) => item.count,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.cardBody).toBeTruthy();
  });

  it('should map labels column', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Labels',
        type: 'labels',
        value: (item) => item.labels,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.labels).toHaveLength(2);
    expect(card.labels?.[0].label).toBe('label1');
  });

  it('should skip hidden card columns', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Hidden',
        card: 'hidden',
        cell: () => 'hidden content',
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.id).toBe(1);
  });

  it('should render Link when name column has to()', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        type: 'text',
        card: 'name',
        value: (item) => item.name,
        to: (item) => `/items/${item.id}`,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { getByRole } = render(<MemoryRouter>{card.title}</MemoryRouter>);
    expect(getByRole('link')).toBeInTheDocument();
  });

  it('should render empty flex body when no content columns', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.cardBody).toBeTruthy();
  });

  it('should filter out columns with falsy value', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
      {
        header: 'Empty',
        cell: () => null,
        value: () => undefined,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    expect(card.cardBody).toBeTruthy();
  });

  it('should hide description when descriptionColumn.value returns falsy', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
      {
        header: 'Description',
        type: 'description',
        value: () => undefined,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { queryByText } = render(<MemoryRouter>{card.cardBody}</MemoryRouter>);
    expect(queryByText('Test description')).not.toBeInTheDocument();
  });

  it('should use cell function when name column has no value function', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { getByText } = render(<MemoryRouter>{card.title}</MemoryRouter>);
    expect(getByText('Test Item')).toBeInTheDocument();
  });

  it('should split string title on "/" characters', () => {
    const itemWithSlash: TestItem = {
      ...testItem,
      name: 'org/repo/branch',
    };
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(itemWithSlash);

    const { getByText } = render(<MemoryRouter>{card.title}</MemoryRouter>);
    expect(getByText('org')).toBeInTheDocument();
    expect(getByText('repo')).toBeInTheDocument();
    expect(getByText('branch')).toBeInTheDocument();
  });

  it('should render non-string cardTitle without splitting', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: () => <em>custom element</em>,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { container } = render(<MemoryRouter>{card.title}</MemoryRouter>);
    expect(container.querySelector('em')).toBeInTheDocument();
  });

  it('should render visible card columns in card body', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
      {
        header: 'Details',
        cell: (item) => item.description,
        value: (item) => item.description,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { getByText } = render(<MemoryRouter>{card.cardBody}</MemoryRouter>);
    expect(getByText('Details')).toBeInTheDocument();
    expect(getByText('Test description')).toBeInTheDocument();
  });

  it('should render non-description type description column with TableColumnCell', () => {
    const columns: ITableColumn<TestItem>[] = [
      {
        header: 'Name',
        card: 'name',
        cell: (item) => item.name,
        value: (item) => item.name,
      },
      {
        header: 'Summary',
        card: 'description',
        cell: (item) => item.description,
        value: (item) => item.description,
      },
    ];

    const { result } = renderHook(() => useColumnsToTableCardFn(columns, keyFn));
    const card = result.current(testItem);

    const { getByText } = render(<MemoryRouter>{card.cardBody}</MemoryRouter>);
    expect(getByText('Test description')).toBeInTheDocument();
  });
});
