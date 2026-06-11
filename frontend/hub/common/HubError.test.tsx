import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { HubError } from './HubError';

describe('HubError', () => {
  it('should render with default error message when no error provided', () => {
    render(<HubError />);

    expect(screen.getByText('NotFound')).toBeInTheDocument();
  });

  it('should render with custom error message', () => {
    const error = new Error('Something went wrong');
    render(<HubError error={error} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render refresh button when handleRefresh is provided', () => {
    const handleRefresh = vi.fn();
    render(<HubError handleRefresh={handleRefresh} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should call handleRefresh when refresh button is clicked', () => {
    const handleRefresh = vi.fn();
    render(<HubError handleRefresh={handleRefresh} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    fireEvent.click(refreshButton);

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('should not render refresh button when handleRefresh is not provided', () => {
    render(<HubError />);

    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('should render error details when error is a RequestError with details', () => {
    // RequestError constructor: (message, details, statusCode, body, json)
    const error = new RequestError(
      'Request failed',
      'Detailed error information',
      500,
      { error: 'test' },
      { error: 'test' }
    );
    render(<HubError error={error} />);

    expect(screen.getByText('Request failed')).toBeInTheDocument();
    expect(screen.getByText('Detailed error information')).toBeInTheDocument();
  });

  it('should not render error details for regular Error', () => {
    const error = new Error('Regular error');
    render(<HubError error={error} />);

    expect(screen.getByText('Regular error')).toBeInTheDocument();
    // Regular errors don't have details property
    expect(screen.queryByText('Detailed error information')).not.toBeInTheDocument();
  });
});
