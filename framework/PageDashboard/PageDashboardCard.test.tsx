import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageDashboard } from './PageDashboard';
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

  it('should render optional header metadata and collapse the card body', async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(
      <MemoryRouter>
        <PageDashboard>
          <PageDashboardCard
            id="meta-card"
            supertitle="Overview"
            title="Jobs"
            subtitle="Last 24 hours"
            description="Summary description"
            help="Inline help"
            helpTitle="Jobs help"
            width="xxl"
            height="sm"
            canCollapse
            disableBodyPadding
          >
            <div>Body</div>
          </PageDashboardCard>
        </PageDashboard>
      </MemoryRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();

    const icons = screen.getByTestId('meta-card').querySelectorAll('svg');
    const collapseToggle = icons[icons.length - 1] as SVGElement;
    await user.click(collapseToggle);
    await waitFor(() => {
      expect(localStorage.getItem('db-meta-card-collapsed')).toBe('true');
    });
  });
});
