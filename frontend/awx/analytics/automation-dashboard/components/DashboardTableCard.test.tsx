/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { DashboardTableCard } from './DashboardTableCard';
import type { DashboardTableItem } from '../interfaces';
import userEvent from '@testing-library/user-event';

const defaultProps = {
  id: 'test-table-card',
  title: 'Test Table',
  help: 'Help text',
  firstColumnHeader: 'Name',
  emptyStateTitle: 'No Data',
  errorStateTitle: 'Error!',
  items: [
    { name: 'Item 1', value: 10 },
    { name: 'Item 2', value: 20 },
  ] as DashboardTableItem[],
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
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is currently no data available.')).toBeInTheDocument();
  });

  test('shows error state title if provided', () => {
    render(
      <DashboardTableCard
        {...defaultProps}
        items={[]}
        error={new Error()}
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
});
