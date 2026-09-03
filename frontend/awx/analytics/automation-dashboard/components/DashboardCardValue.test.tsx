import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { DashboardCardValueDisplay, getDashboardCardValueFontSize } from './DashboardCardValue';

describe('getDashboardCardValueFontSize', () => {
  const sizes = { compact: 'x-large', expanded: 'xx-large' };

  test('should always use the large size for non-numeric values', () => {
    expect(getDashboardCardValueFontSize('No jobs have been run.', 'xs', sizes)).toBe('large');
    expect(getDashboardCardValueFontSize('No jobs have been run.', 'md', sizes)).toBe('large');
  });

  test('should use the compact size for numbers only at xs width', () => {
    expect(getDashboardCardValueFontSize(1234, 'xs', sizes)).toBe('x-large');
    expect(getDashboardCardValueFontSize(1234, 'md', sizes)).toBe('xx-large');
    expect(getDashboardCardValueFontSize(1234, undefined, sizes)).toBe('xx-large');
  });
});

describe('DashboardCardValueDisplay', () => {
  test('should format a numeric value with locale grouping and append the suffix', () => {
    render(<DashboardCardValueDisplay value={12345} valueSuffix="h" fontSize="xx-large" />);

    expect(screen.getByText('12,345 h')).toBeInTheDocument();
  });

  test('should render a string value unchanged and without a suffix', () => {
    render(<DashboardCardValueDisplay value="No jobs have been run." fontSize="large" />);

    expect(screen.getByText('No jobs have been run.')).toBeInTheDocument();
  });

  test('should format a numeric value as currency when requested', () => {
    render(<DashboardCardValueDisplay value={1000} formatAsCurrency fontSize="large" />);

    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  test('should apply the given font size', () => {
    render(<DashboardCardValueDisplay value={42} fontSize="xx-large" />);

    expect(screen.getByText('42')).toHaveStyle({ fontSize: 'xx-large' });
  });
});
