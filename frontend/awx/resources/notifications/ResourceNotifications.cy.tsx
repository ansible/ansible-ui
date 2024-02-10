import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { ResourceNotifications } from './ResourceNotifications';

describe('ResourceNotifications', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/notification_templates/**',
        hostname: 'localhost',
      },
      {
        fixture: 'notification_templates.json',
      }
    );
  });

  it('renders resource notifications', () => {
    cy.mount(<ResourceNotifications resourceType="inventory_sources" />);
    cy.fixture('notification_templates.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: NotificationTemplate[]) => {
        const notification = results[0];
        cy.contains(notification.name);
      });
  });

  it('Should toggle start switch on', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v2/inventory_sources/1/notification_templates_started/',
        hostname: 'localhost',
      },
      (req) => {
        expect(req.body).to.contain({
          id: 1,
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/inventory_sources/1/notification_templates_started/',
        hostname: 'localhost',
      },
      { fixture: 'notification_toggle.json' }
    );
    cy.mount(<ResourceNotifications resourceType="inventory_sources" />, {
      path: '/:source_id/',
      initialEntries: ['/1'],
    });
    cy.get(':nth-child(1) > div > .pf-v5-c-switch').click();
  });

  it('filter by name', () => {
    cy.mount(<ResourceNotifications resourceType="inventory_sources" />);
    cy.fixture('notification_templates.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/notification_templates/?name__icontains=csantiago**',
          },
          {
            fixture: 'notification_templates.json',
          }
        ).as('nameFilter');
        cy.filterTableByTypeAndText(/^Name$/, 'csantiago_notification');
        cy.get('@nameFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });

  it('filter by created by', () => {
    cy.mount(<ResourceNotifications resourceType="inventory_sources" />);
    cy.fixture('notification_templates.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/notification_templates/?created_by__username__icontains=dev**',
          },
          {
            fixture: 'notification_templates.json',
          }
        ).as('createdByFilter');
        cy.filterTableByTypeAndText(/^Created by$/, 'dev');
        cy.get('@createdByFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });

  it('filter by modified by', () => {
    cy.mount(<ResourceNotifications resourceType="inventory_sources" />);
    cy.fixture('notification_templates.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/notification_templates/?modified_by__username__icontains=dev**',
          },
          {
            fixture: 'notification_templates.json',
          }
        ).as('modifiedByFilter');
        cy.filterTableByTypeAndText(/^Modified by$/, 'dev');
        cy.get('@modifiedByFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });
});
