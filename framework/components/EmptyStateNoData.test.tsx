/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyStateNoData } from './EmptyStateNoData';

describe('EmptyStateNoData', () => {
  it('renders title and description with default icon', () => {
    render(<EmptyStateNoData title="No items" description="Add an item to get started" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Add an item to get started')).toBeInTheDocument();
  });

  it('renders optional action button', () => {
    render(
      <EmptyStateNoData
        title="No items"
        description="Empty"
        button={<button type="button">Create</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
