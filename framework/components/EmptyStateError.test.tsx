import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyStateError } from './EmptyStateError';

describe('EmptyStateError', () => {
  it('renders default messaging', () => {
    render(<EmptyStateError />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('Please refresh the page by using the button below.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('allows overriding title and message', () => {
    render(<EmptyStateError titleProp="Custom error" message="Try later" />);
    expect(screen.getByText('Custom error')).toBeInTheDocument();
    expect(screen.getByText('Try later')).toBeInTheDocument();
  });

  it('reloads the page when Refresh is clicked', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });

    render(<EmptyStateError />);
    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
