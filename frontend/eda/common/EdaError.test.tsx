import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { EdaError } from './EdaError';

describe('EdaError', () => {
  it('should render the error message', () => {
    render(<EdaError error={new Error('Something failed')} />);

    expect(screen.getByText('Something failed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('should render request error details and invoke refresh', async () => {
    const user = userEvent.setup();
    const handleRefresh = vi.fn();
    const error = new RequestError('Request failed', 'More detail', 500, {}, {});

    render(<EdaError error={error} handleRefresh={handleRefresh} />);

    expect(screen.getByText('Request failed')).toBeInTheDocument();
    expect(screen.getByText('More detail')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(handleRefresh).toHaveBeenCalled();
  });
});
