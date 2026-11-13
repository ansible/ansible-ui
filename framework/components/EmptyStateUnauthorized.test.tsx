import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyStateUnauthorized } from './EmptyStateUnauthorized';

describe('EmptyStateUnauthorized', () => {
  it('renders default unauthorized copy', () => {
    render(<EmptyStateUnauthorized />);
    expect(screen.getByText('You do not have access')).toBeInTheDocument();
    expect(
      screen.getByText('Contact your organization administrator for more information.')
    ).toBeInTheDocument();
  });

  it('renders custom title, message, and login link', () => {
    render(
      <EmptyStateUnauthorized
        title="Denied"
        adminMessage="Ask admin"
        loginLink={<a href="/login">Log in</a>}
      />
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
    expect(screen.getByText('Ask admin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });
});
