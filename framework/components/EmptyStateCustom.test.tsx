/* eslint-disable i18next/no-literal-string */
import { SearchIcon } from '@patternfly/react-icons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyStateCustom } from './EmptyStateCustom';

describe('EmptyStateCustom', () => {
  it('renders title, description, and optional footer content', () => {
    render(
      <EmptyStateCustom
        title="No results"
        description="Try adjusting filters"
        footNote="Need help?"
        variant="lg"
        style={{ padding: 8 }}
        icon={SearchIcon}
        button={<button type="button">Create</button>}
        image={<span data-testid="empty-image">Illustration</span>}
      />
    );

    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByTestId('Try adjusting filters')).toHaveTextContent('Try adjusting filters');
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByText('Need help?')).toBeInTheDocument();
    expect(screen.getByTestId('empty-image')).toBeInTheDocument();
  });

  it('renders without optional footer elements', () => {
    const { container } = render(<EmptyStateCustom title="Empty" description="Nothing to show" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByTestId('Nothing to show')).toBeInTheDocument();
    expect(container.querySelector('.pf-v6-c-empty-state__footer')).toBeInTheDocument();
  });
});
