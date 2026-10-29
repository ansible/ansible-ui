/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { DashboardTableCard } from './DashboardTableCard';

import userEvent from '@testing-library/user-event';
import { DashboardTableCardProps, IDashboardTableItem } from '../types';

const defaultProps: DashboardTableCardProps = {
  id: 'test-table-card',
  title: 'Test Table',
  help: 'Help text',
  firstColumnHeader: 'Name',
  errorStateTitle: 'Error!',
  loading: false,
  clearAllFilters: () => {},
  filterState: {},
  items: [
    { id: 1, name: 'Item 1', execution_count: 10 },
    { id: 2, name: 'Item 2', execution_count: 20 },
  ] as IDashboardTableItem[],
};

describe('DashboardTableCard', () => {
  test('renders with required props and displays table data', () => {
    render(<DashboardTableCard {...defaultProps} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Total no. of jobs')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('shows empty state when items is empty', () => {
    render(<DashboardTableCard {...defaultProps} items={[]} />);
    expect(screen.getByRole('heading', { name: 'No data' })).toBeInTheDocument();
  });

  test('should show skeletons and hide table columns when loading', () => {
    render(<DashboardTableCard {...defaultProps} loading={true} />);
    expect(document.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Name/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: /Total no. of jobs/i })
    ).not.toBeInTheDocument();
  });

  test('shows error state title if provided', () => {
    render(
      <DashboardTableCard
        {...defaultProps}
        items={[]}
        error={new Error('test error')}
        errorStateTitle="Custom Error"
      />
    );
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  test('renders help text in the card', async () => {
    const user = userEvent.setup();
    render(<DashboardTableCard {...defaultProps} />);
    const helpButton = screen.getByRole('button');
    await user.click(helpButton);
    expect(screen.getByText('Help text')).toBeInTheDocument();
  });

  test('falls back to empty array and zero count when items is undefined', () => {
    const { items: _items, ...propsWithoutItems } = defaultProps;
    render(<DashboardTableCard {...propsWithoutItems} />);
    // pageItems falls back to [] and itemCount to 0 — empty state is shown
    expect(screen.getByRole('heading', { name: 'No data' })).toBeInTheDocument();
  });

  test('renders 0 in the value cell when execution_count is 0', () => {
    const items = [{ id: 1, name: 'Zero Count Item', execution_count: 0 }] as IDashboardTableItem[];
    render(<DashboardTableCard {...defaultProps} items={items} />);
    const row = screen.getByText('Zero Count Item').closest('tr');
    const valueCell = row?.querySelectorAll('td')[1];
    expect(valueCell).toHaveTextContent(/^0$/);
  });

  test('should render long names with PatternFly Truncate so the full name stays available', () => {
    const longName = 'A very long project name that does not fit in the name column of the card';
    const items = [{ id: 1, name: longName, execution_count: 1 }] as IDashboardTableItem[];
    render(<DashboardTableCard {...defaultProps} items={items} />);
    const nameElement = screen.getByText(longName);
    expect(nameElement.closest('.pf-v6-c-truncate')).toBeInTheDocument();
  });

  test('renders empty value cell when execution_count is undefined', () => {
    const items = [{ id: 1, name: 'No Count Item' }] as IDashboardTableItem[];
    render(<DashboardTableCard {...defaultProps} items={items} />);
    const row = screen.getByText('No Count Item').closest('tr');
    const valueCell = row?.querySelectorAll('td')[1];
    expect(valueCell).toHaveTextContent('');
  });
});
