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
            color: 'var(--pf-v5-chart-color-green-400)',
          },
          {
            label: 'Synced failures',
            count: 2,
            color: 'var(--pf-v5-chart-color-red-400)',
          },
        ],
      },
    ];
    cy.mount(<PageDashboardCountBar counts={counts} />);

    cy.get('#inventories a').should('contain', '13 Inventories');
    cy.get('#inventories-legend-synced-count').should('contain', 11);
    cy.get('#inventories-legend-synced-failures-count').should('contain', 2);
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
            color: 'var(--pf-v5-chart-color-green-400)',
          },
          {
            label: 'Failed',
            count: 13,
            color: 'var(--pf-v5-chart-color-red-400)',
          },
        ],
      },
    ];
    cy.mount(<PageDashboardCountBar counts={counts} />);

    cy.get('#hosts a').should('contain', '113 Hosts');
    cy.get('#hosts-legend-ready-count').should('contain', 100);
    cy.get('#hosts-legend-failed-count').should('contain', 13);
  });

  it('shoud display projects count', () => {
    const counts = [
      {
        title: 'Projects',
        to: '/projects',
        counts: [
          {
            label: 'Synced',
            count: 11,
            color: 'var(--pf-v5-chart-color-green-400)',
          },
          {
            label: 'Synced failures',
            count: 2,
            color: 'var(--pf-v5-chart-color-red-400)',
          },
        ],
      },
    ];
    cy.mount(<PageDashboardCountBar counts={counts} />);

    cy.get('#projects a').should('contain', '13 Projects');
    cy.get('#projects-legend-synced-count').should('contain', 11);
    cy.get('#projects-legend-synced-failures-count').should('contain', 2);
  });
});
