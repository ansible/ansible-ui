/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTableEmptyState } from './PageTableEmptyState';

describe('PageTableEmptyState', () => {
  it('should render title and default icon', () => {
    render(<PageTableEmptyState title="No items found" />);
    expect(screen.getByRole('heading', { name: 'No items found' })).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<PageTableEmptyState title="No items" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render footer children', () => {
    render(
      <PageTableEmptyState title="No items">
        <button>Create item</button>
      </PageTableEmptyState>
    );
    expect(screen.getByRole('button', { name: 'Create item' })).toBeInTheDocument();
  });
});
