/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageDashboardCount } from './PageDashboardCount';

describe('PageDashboardCount', () => {
  it('should render the count and title', () => {
    render(
      <MemoryRouter>
        <PageDashboardCount title="Projects" count={42} />
      </MemoryRouter>
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should render with link text and destination', () => {
    render(
      <MemoryRouter>
        <PageDashboardCount title="Hosts" count={10} linkText="View all" to="/hosts" />
      </MemoryRouter>
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  it('should render zero count', () => {
    render(
      <MemoryRouter>
        <PageDashboardCount title="Jobs" count={0} />
      </MemoryRouter>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
