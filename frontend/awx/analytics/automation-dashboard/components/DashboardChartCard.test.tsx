import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { DashboardChartCard } from './DashboardChartCard';
import { DashboardChartCardProps } from '../types';

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageDashboardCard: ({
    children,
    help,
    title,
  }: {
    children: React.ReactNode;
    help?: string;
    title?: string;
  }) => (
    <div data-testid="dashboard-card" data-help={help} title={title}>
      {children}
    </div>
  ),
  PageDashboardChart: (props: { [key: string]: unknown }) => (
    <div data-testid="dashboard-chart" {...props} />
  ),
}));

vi.mock('@patternfly/react-core', () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div data-testid="flex">{children}</div>,
  FlexItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flex-item">{children}</div>
  ),
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe('DashboardChartCard', () => {
  const baseProps = {
    id: 'test-id',
    title: 'Test Title',
    help: 'Help text',
    summaryValue: 1234,
    values: [
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
      { label: 'C', value: 3 },
    ],
    variant: 'barChart',
  } as DashboardChartCardProps;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render the title as a prop and display the summary value in any locale format', () => {
    render(<DashboardChartCard {...baseProps} />);
    const card = screen.getByTestId('dashboard-card');
    expect(card).toHaveAttribute('title', 'Test Title');
    // Match summary value in any locale format
    expect(
      screen.getByText(
        (content) => content === '1234' || content === '1,234' || content === '1.234'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-chart')).toBeInTheDocument();
  });

  test('should render fallback "--" when summaryValue is missing', () => {
    render(<DashboardChartCard {...baseProps} summaryValue={undefined} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  test('should render 0 when summaryValue is 0', () => {
    render(<DashboardChartCard {...baseProps} summaryValue={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should pass the help text to PageDashboardCard as a data attribute', () => {
    render(<DashboardChartCard {...baseProps} help="Some help" />);
    const card = screen.getByTestId('dashboard-card');
    expect(card).toHaveAttribute('data-help', 'Some help');
  });

  test('should pass the correct variant prop to PageDashboardChart', () => {
    render(<DashboardChartCard {...baseProps} variant="barChart" />);
    const chart = screen.getByTestId('dashboard-chart');
    expect(chart.getAttribute('variant')).toBe('barChart');
  });
});
