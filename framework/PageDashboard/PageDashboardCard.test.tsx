import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboardCard } from './PageDashboardCard';

function renderCard(props: Parameters<typeof PageDashboardCard>[0]) {
  return render(
    <MemoryRouter>
      <PageDashboardCard {...props} />
    </MemoryRouter>
  );
}

describe('PageDashboardCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not render the link when linkText is not provided', () => {
    renderCard({ title: 'Inventories' });

    expect(screen.queryByTestId('card-link-text')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render the link when linkText and to are provided', () => {
    renderCard({ title: 'Inventories', linkText: 'View all', to: '/inventories' });

    const link = screen.getByRole('link', { name: 'View all' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/inventories');
  });

  it('should render the header and link when only linkText is provided without a title', () => {
    renderCard({ linkText: 'View all', to: '/inventories' });

    expect(screen.getByRole('link', { name: 'View all' })).toBeInTheDocument();
  });

  it('should render optional header and footer content', () => {
    renderCard({
      title: 'Inventories',
      supertitle: 'Automation',
      subtitle: 'Managed resources',
      description: 'Inventory information',
      headerControls: <button type="button">Refresh</button>,
      linkText: 'View all',
      to: '/inventories',
      footerActionButton: {
        title: 'Add inventory',
        icon: <span data-testid="footer-icon" />,
        onClick: vi.fn(),
      },
    });

    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Managed resources')).toBeInTheDocument();
    expect(screen.getByText('Inventory information')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByTestId('footer-icon')).toBeInTheDocument();
  });

  it('should not render a header when neither title nor linkText are provided', () => {
    renderCard({ children: <div>Body</div> });

    expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-link-text')).not.toBeInTheDocument();
  });

  it('should render children in the card body', () => {
    renderCard({ title: 'Inventories', children: <div>Card content</div> });

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should call onClick when the footer action button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderCard({
      title: 'Inventories',
      footerActionButton: { title: 'Add inventory', onClick },
    });

    await user.click(screen.getByRole('button', { name: 'Add inventory' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not apply compact styling when isCompact is not provided', () => {
    renderCard({ id: 'compact-card-test', title: 'Inventories' });

    expect(screen.getByTestId('compact-card-test')).not.toHaveClass('pf-m-compact');
  });

  it('should apply compact styling when isCompact is true', () => {
    renderCard({ id: 'compact-card-test', title: 'Inventories', isCompact: true });

    expect(screen.getByTestId('compact-card-test')).toHaveClass('pf-m-compact');
  });

  it('should collapse the card and persist its state when the collapse control is clicked', async () => {
    const user = userEvent.setup();
    renderCard({
      id: 'collapsible-card-test',
      title: 'Inventories',
      canCollapse: true,
      children: <div>Card content</div>,
    });

    const collapseControl = screen.getByRole('button', { name: 'Collapse' });
    expect(collapseControl).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapseControl);

    expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(localStorage.getItem('db-collapsible-card-test-collapsed')).toBe('true');
  });
});
