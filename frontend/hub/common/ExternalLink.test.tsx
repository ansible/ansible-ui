import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('renders a default external link', () => {
    render(
      <ExternalLink href="https://example.com/docs" data-cy="docs-link">
        Docs
      </ExternalLink>
    );

    const link = screen.getByRole('link', { name: /Docs/ });
    expect(link).toHaveAttribute('href', 'https://example.com/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'nofollow noopener noreferrer');
    expect(link).toHaveAttribute('data-cy', 'docs-link');
  });

  it.each(['nav', 'menu', 'download'] as const)('renders the %s variant', (variant) => {
    render(
      <ExternalLink href="https://example.com/docs" variant={variant}>
        Docs
      </ExternalLink>
    );

    const link = screen.getByRole('link', { name: /Docs/ });
    if (variant === 'nav') {
      expect(link).toHaveClass('pf-v6-c-nav__link');
    } else if (variant === 'menu') {
      expect(link).toHaveClass('pf-v6-c-dropdown__menu-item');
    } else {
      expect(link).not.toHaveClass('pf-v6-c-nav__link');
    }
  });

  it('falls back to the default icon style for an unknown variant', () => {
    render(
      <ExternalLink href="https://example.com/docs" variant={'unknown' as 'default'}>
        Docs
      </ExternalLink>
    );

    expect(screen.getByRole('link', { name: /Docs/ })).toBeInTheDocument();
  });

  it('renders nothing when href or children are missing', () => {
    const { rerender } = render(<ExternalLink href="">Docs</ExternalLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    rerender(<ExternalLink href="https://example.com">{''}</ExternalLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
