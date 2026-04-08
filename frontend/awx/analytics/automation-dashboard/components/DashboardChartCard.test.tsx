import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { DashboardChartCard } from './DashboardChartCard';
import type { DashboardChartCardProps } from '../types';

const defaultProps: DashboardChartCardProps = {
  id: 'test-card',
  title: 'Test Title',
  help: 'Help text',
  summaryValue: 12345,
  data: { kind: 'day', items: [{ label: '2024-06-15T00:00:00', value: 3 }] },
  variant: 'barChart',
  errorStateTitle: 'Chart Error',
};

const expectedFormatted = (12345).toLocaleString();

describe('DashboardChartCard', () => {
  test('should render summary value in locale format', () => {
    render(<DashboardChartCard {...defaultProps} />);
    expect(screen.getByText(expectedFormatted)).toBeInTheDocument();
  });

  test('should render "--" when summaryValue is undefined', () => {
    render(<DashboardChartCard {...defaultProps} summaryValue={undefined} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  test('should render "0" when summaryValue is 0', () => {
    render(<DashboardChartCard {...defaultProps} summaryValue={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should render error state with errorStateTitle and error message when error is provided', () => {
    render(<DashboardChartCard {...defaultProps} error={new Error('Chart failed')} />);
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Chart failed')).toBeInTheDocument();
    expect(screen.queryByText(expectedFormatted)).not.toBeInTheDocument();
  });

  test('should not render error state when error is not provided', () => {
    render(<DashboardChartCard {...defaultProps} />);
    expect(screen.queryByText('Chart Error')).not.toBeInTheDocument();
    expect(screen.getByText(expectedFormatted)).toBeInTheDocument();
  });
});
