/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageDashboardCarousel } from './PageDashboardCarousel';

vi.mock('../hooks/useResizeObserver', () => ({
  useResizeObserver: vi.fn(),
}));

describe('PageDashboardCarousel', () => {
  it('renders carousel content inside a dashboard card', () => {
    render(
      <MemoryRouter>
        <PageDashboardCarousel title="Featured jobs" linkText="View all" to="/jobs">
          <div>Slide one</div>
          <div>Slide two</div>
        </PageDashboardCarousel>
      </MemoryRouter>
    );

    expect(screen.getByText('Featured jobs')).toBeInTheDocument();
    expect(screen.getByText('Slide one')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/jobs');
  });

  it('invokes footer action when provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <PageDashboardCarousel title="Actions" footerActionButton={{ title: 'Add', onClick }}>
          <div>Card</div>
        </PageDashboardCarousel>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
