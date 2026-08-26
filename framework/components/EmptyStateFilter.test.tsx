/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyStateFilter } from './EmptyStateFilter';

describe('EmptyStateFilter', () => {
  it('should render with default title and description', () => {
    render(<EmptyStateFilter />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('No results match the filter criteria. Try changing your filter settings.')
    ).toBeInTheDocument();
  });

  it('should render custom title and description', () => {
    render(<EmptyStateFilter title="Custom Title" description="Custom Description" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });

  it('should show clear button when clearAllFilters is provided', () => {
    const clearFn = vi.fn();
    render(<EmptyStateFilter clearAllFilters={clearFn} />);
    expect(screen.getByRole('button', { name: 'Clear all filters' })).toBeInTheDocument();
  });

  it('should call clearAllFilters when button is clicked', async () => {
    const user = userEvent.setup();
    const clearFn = vi.fn();
    render(<EmptyStateFilter clearAllFilters={clearFn} />);

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(clearFn).toHaveBeenCalledOnce();
  });

  it('should not render button when clearAllFilters is not provided', () => {
    render(<EmptyStateFilter />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render custom button text', () => {
    render(<EmptyStateFilter clearAllFilters={vi.fn()} button="Reset Filters" />);
    expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeInTheDocument();
  });
});
