import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageDashboardCountBar } from './PageDashboardCountBar';

describe('PageDashboardCountBar', () => {
  it('should display inventories count', () => {
    const counts = [
      {
        title: 'Inventories',
        to: '/inventories',
        counts: [
          {
            label: 'Synced',
            count: 11,
            color: 'var(--pf-v6-chart-color-green-400)',
          },
          {
            label: 'Synced failures',
            count: 2,
            color: 'var(--pf-v6-chart-color-red-400)',
          },
        ],
      },
    ];

    const { container } = render(
      <MemoryRouter>
        <PageDashboardCountBar counts={counts} />
      </MemoryRouter>
    );

    const inventoriesLink = screen.getByRole('link', { name: /inventories/i });
    expect(inventoriesLink).toHaveTextContent('13 Inventories');

    expect(container.querySelector('#inventories-legend-synced-count')).toHaveTextContent('11');
    expect(container.querySelector('#inventories-legend-synced-failures-count')).toHaveTextContent(
      '2'
    );
  });

  it('should display hosts count', () => {
    const counts = [
      {
        title: 'Hosts',
        to: '/hosts',
        counts: [
          {
            label: 'Ready',
            count: 100,
            color: 'var(--pf-v6-chart-color-green-400)',
          },
          {
            label: 'Failed',
            count: 13,
            color: 'var(--pf-v6-chart-color-red-400)',
          },
        ],
      },
    ];

    const { container } = render(
      <MemoryRouter>
        <PageDashboardCountBar counts={counts} />
      </MemoryRouter>
    );

    const hostsLink = screen.getByRole('link', { name: /hosts/i });
    expect(hostsLink).toHaveTextContent('113 Hosts');

    expect(container.querySelector('#hosts-legend-ready-count')).toHaveTextContent('100');
    expect(container.querySelector('#hosts-legend-failed-count')).toHaveTextContent('13');
  });

  it('should display projects count', () => {
    const counts = [
      {
        title: 'Projects',
        to: '/projects',
        counts: [
          {
            label: 'Synced',
            count: 11,
            color: 'var(--pf-v6-chart-color-green-400)',
          },
          {
            label: 'Synced failures',
            count: 2,
            color: 'var(--pf-v6-chart-color-red-400)',
          },
        ],
      },
    ];

    const { container } = render(
      <MemoryRouter>
        <PageDashboardCountBar counts={counts} />
      </MemoryRouter>
    );

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveTextContent('13 Projects');

    expect(container.querySelector('#projects-legend-synced-count')).toHaveTextContent('11');
    expect(container.querySelector('#projects-legend-synced-failures-count')).toHaveTextContent(
      '2'
    );
  });
});
