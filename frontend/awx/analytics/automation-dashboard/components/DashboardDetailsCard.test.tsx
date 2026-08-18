import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardDetailsCard } from './DashboardDetailsCard';
import { DashboardDetailsCardProps } from '../types';

const defaultProps: DashboardDetailsCardProps = {
  id: 'test-card',
  title: 'Test Title',
  help: 'Help text',
  value: 12345,
  valueSuffix: 'EUR',
  errorStateTitle: 'Card Error',
};

describe('DashboardDetailsCard', () => {
  test('should render title, value, and suffix', () => {
    render(<DashboardDetailsCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('12,345', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
  });

  test('should render help text when help button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardDetailsCard {...defaultProps} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Help text')).toBeInTheDocument();
  }, 10000);

  test('should not render a help button when help is not provided', () => {
    render(<DashboardDetailsCard {...defaultProps} help={undefined} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render value as string when value is not a number', () => {
    render(<DashboardDetailsCard {...defaultProps} value="Test value" valueSuffix={undefined} />);
    expect(screen.getByText('Test value')).toBeInTheDocument();
  });

  test('should not render valueSuffix when valueSuffix is not provided', () => {
    render(<DashboardDetailsCard {...defaultProps} valueSuffix={undefined} />);
    expect(screen.queryByText(/EUR/)).not.toBeInTheDocument();
  });

  test('should render error state with errorStateTitle and error message when error is provided', () => {
    render(<DashboardDetailsCard {...defaultProps} error={new Error('Something failed')} />);
    expect(screen.getByText('Card Error')).toBeInTheDocument();
    expect(screen.getByText('Something failed')).toBeInTheDocument();
    expect(screen.queryByText((12345).toLocaleString('en-US'))).not.toBeInTheDocument();
  });

  test('should not render error state when error is not provided', () => {
    render(<DashboardDetailsCard {...defaultProps} />);
    expect(screen.queryByText('Card Error')).not.toBeInTheDocument();
    expect(screen.getByText('12,345', { exact: false })).toBeInTheDocument();
  });

  describe('formatAsCurrency', () => {
    test('should format numeric value as USD currency when formatAsCurrency is true', () => {
      render(
        <DashboardDetailsCard
          {...defaultProps}
          value={2500}
          valueSuffix={undefined}
          formatAsCurrency={true}
        />
      );
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });

    test('should use toLocaleString when formatAsCurrency is false', () => {
      render(
        <DashboardDetailsCard
          {...defaultProps}
          value={2500}
          valueSuffix={undefined}
          formatAsCurrency={false}
        />
      );
      expect(screen.queryByText('$2,500.00')).not.toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
    });

    test('should use toLocaleString when formatAsCurrency is omitted', () => {
      render(<DashboardDetailsCard {...defaultProps} value={2500} valueSuffix={undefined} />);
      expect(screen.queryByText('$2,500.00')).not.toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
    });

    test('should still render valueSuffix alongside currency-formatted value', () => {
      render(
        <DashboardDetailsCard
          {...defaultProps}
          value={1000}
          valueSuffix="*"
          formatAsCurrency={true}
        />
      );
      expect(screen.getByText(/\$1,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\*/)).toBeInTheDocument();
    });
  });

  describe('font size', () => {
    test('should render value at x-large font size by default (no width)', () => {
      render(<DashboardDetailsCard {...defaultProps} />);
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'x-large' });
    });

    test('should render value at large font size when width is xs', () => {
      render(<DashboardDetailsCard {...defaultProps} width="xs" />);
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'large' });
    });
  });
});
