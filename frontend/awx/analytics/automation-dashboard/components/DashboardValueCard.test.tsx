import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { DashboardValueCard } from './DashboardValueCard';
import { DashboardValueCardProps } from '../types';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const defaultProps: DashboardValueCardProps = {
  id: 'test-card',
  title: 'Test Title',
  help: 'Help text',
  value: 12345,
  linkText: 'Details',
  to: '/execution/jobs',
  valueSuffix: 'EUR',
  errorStateTitle: 'Card Error',
};

describe('DashboardValueCard', () => {
  test('should render title, value, and suffix', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('12,345', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
  });

  test('should render help text when help button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole('button');
    // Click the help button (first button in this case)
    await user.click(buttons[0]);
    expect(screen.getByText('Help text')).toBeInTheDocument();
  }, 10000);

  test('should not render helpTitle when help is not provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} help={undefined} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render link text when linkText and to are provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  test('should render value as string when value is not a number', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} value="Test value" valueSuffix={undefined} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test value')).toBeInTheDocument();
  });

  test('should not render valueSuffix when valueSuffix is not provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} valueSuffix={undefined} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/EUR/)).not.toBeInTheDocument();
  });

  test('should render error state with errorStateTitle and error message when error is provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} error={new Error('Something failed')} />
      </MemoryRouter>
    );
    expect(screen.getByText('Card Error')).toBeInTheDocument();
    expect(screen.getByText('Something failed')).toBeInTheDocument();
    expect(screen.queryByText((12345).toLocaleString('en-US'))).not.toBeInTheDocument();
  });

  test('should not render error state when error is not provided', () => {
    render(
      <MemoryRouter>
        <DashboardValueCard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.queryByText('Card Error')).not.toBeInTheDocument();
    expect(screen.getByText('12,345', { exact: false })).toBeInTheDocument();
  });

  describe('formatAsCurrency', () => {
    test('should format numeric value as USD currency when formatAsCurrency is true', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard
            {...defaultProps}
            value={2500}
            valueSuffix={undefined}
            formatAsCurrency={true}
          />
        </MemoryRouter>
      );
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    });

    test('should use toLocaleString when formatAsCurrency is false', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard
            {...defaultProps}
            value={2500}
            valueSuffix={undefined}
            formatAsCurrency={false}
          />
        </MemoryRouter>
      );
      expect(screen.queryByText('$2,500.00')).not.toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
    });

    test('should use toLocaleString when formatAsCurrency is omitted', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} value={2500} valueSuffix={undefined} />
        </MemoryRouter>
      );
      expect(screen.queryByText('$2,500.00')).not.toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
    });

    test('should still render valueSuffix alongside currency-formatted value', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard
            {...defaultProps}
            value={1000}
            valueSuffix="*"
            formatAsCurrency={true}
          />
        </MemoryRouter>
      );
      expect(screen.getByText(/\$1,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\*/)).toBeInTheDocument();
    });
  });

  describe('isNested', () => {
    test('should render title at xl size and card without compact styling when isNested is not provided', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByTestId('card-title')).toHaveClass('pf-m-xl');
      expect(screen.getByTestId('test-card')).not.toHaveClass('pf-m-compact');
    });

    test('should render title at md size and card with compact styling when isNested is true', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} isNested />
        </MemoryRouter>
      );
      expect(screen.getByTestId('card-title')).toHaveClass('pf-m-md');
      expect(screen.getByTestId('card-title')).not.toHaveClass('pf-m-xl');
      expect(screen.getByTestId('test-card')).toHaveClass('pf-m-compact');
    });

    test('should render value at xx-large font size by default (not nested, no width)', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'xx-large' });
    });

    test('should render value at x-large font size when not nested and width is xs', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} width="xs" />
        </MemoryRouter>
      );
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'x-large' });
    });

    test('should render value at x-large font size when nested and width is not xs', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} isNested width="md" />
        </MemoryRouter>
      );
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'x-large' });
    });

    test('should render value at large font size when nested and width is xs', () => {
      render(
        <MemoryRouter>
          <DashboardValueCard {...defaultProps} isNested width="xs" />
        </MemoryRouter>
      );
      expect(screen.getByText('12,345', { exact: false })).toHaveStyle({ fontSize: 'large' });
    });
  });
});
