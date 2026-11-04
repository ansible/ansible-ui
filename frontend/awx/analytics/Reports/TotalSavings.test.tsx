/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TotalSavings } from './TotalSavings';

describe('TotalSavings', () => {
  it('shows formatted savings for total and current page', () => {
    render(<TotalSavings totalSavings={5000} currentPageSavings={1200} isLoading={false} />);
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
  });

  it('shows spinners while loading', () => {
    render(<TotalSavings totalSavings={0} currentPageSavings={0} isLoading />);
    expect(screen.getAllByTestId('spinner')).toHaveLength(2);
  });
});
