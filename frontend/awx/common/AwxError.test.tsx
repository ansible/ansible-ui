import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AwxError } from './AwxError';

describe('AwxError', () => {
  it('should render error message', () => {
    const error = new Error('Something went wrong');
    render(
      <MemoryRouter>
        <AwxError error={error} />
      </MemoryRouter>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render Refresh button when handleRefresh is provided', () => {
    const error = new Error('Network error');
    const handleRefresh = () => {};
    render(
      <MemoryRouter>
        <AwxError error={error} handleRefresh={handleRefresh} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
