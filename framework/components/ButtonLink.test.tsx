import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ButtonLink } from './ButtonLink';

describe('ButtonLink', () => {
  it('renders a router link button with default icon', () => {
    render(
      <MemoryRouter>
        <ButtonLink href="/create">Create</ButtonLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Create' });
    expect(link).toHaveAttribute('href', '/create');
  });

  it('renders a custom icon when provided', () => {
    render(
      <MemoryRouter>
        <ButtonLink href="/go" icon={<span data-testid="custom-icon" />}>
          Go
        </ButtonLink>
      </MemoryRouter>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
