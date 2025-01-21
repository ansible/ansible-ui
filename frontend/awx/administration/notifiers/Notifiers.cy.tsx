import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import { Notifiers } from './Notifiers';

describe('Notifiers.cy.tsx', () => {
  describe('Error list', () => {
    it('Displays error if notifiers are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/notification_templates/*` }, { statusCode: 500 });
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<Notifiers />);
      cy.contains('Error loading notifiers');
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates/` },
        { fixture: 'mock_options.json' }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'notification_templates.json' }
      );
    });
    it('Component renders', () => {
      cy.mount(<Notifiers />);
      cy.verifyPageTitle('Notifiers');
      cy.get('table').find('tr').should('have.length', 2);
    });

    it('Bulk deletion confirmation', () => {
      cy.mount(<Notifiers />);
      cy.getByDataCy('select-all').check();
      cy.clickToolbarKebabAction('delete-notifiers');
      cy.contains('Delete notifiers').should('be.visible');
    });
  });
  describe('Notifiers RBAC', () => {
    it('Add notifier button is disabled if the user does not have the correct permissions', () => {
      cy.fixture('awx_notifier_options.json').then((optionsResponse) => {
        const { actions } = optionsResponse as {
          actions: { GET?: Record<string, unknown>; POST?: Record<string, unknown> };
        };
        delete actions.POST;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return cy.intercept('OPTIONS', awxAPI`/notification_templates`, {
          ...optionsResponse,
          actions,
        });
      });
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="create-notifier"]').should('have.attr', 'aria-disabled', 'true');
    });

    it('Add notifier button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates/` },
        { fixture: 'awx_notifier_options.json' }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="create-notifier"]').should('have.attr', 'aria-disabled', 'false');
    });

    it('Copy notifier button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates/` },
        { fixture: 'awx_notifier_options.json' }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('actions-dropdown').click();
      });
      cy.getByDataCy('copy-notifier').should('not.be.disabled');
    });

    it('Edit notifier button is enabled if the user has the correct permissions', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates/` },
        { fixture: 'awx_notifier_options.json' }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'notification_templates.json' }
      );
      cy.mount(<Notifiers />);
      cy.get('[data-cy="edit-notifier"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/notification_templates/*` },
        { fixture: 'emptyList.json' }
      );
    });
    it('Empty state is displayed correctly for user with permission to add notifier', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/notification_templates` },
        { fixture: 'awx_notifier_options.json' }
      );
      cy.mount(<Notifiers />);
      cy.contains(/^No notifiers found.$/);
      cy.contains(/^Please create notifiers to populate this list.$/);
      cy.contains(/^Create notifier$/).should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to add notifier', () => {
      cy.fixture('awx_notifier_options.json').then((optionsResponse) => {
        const { actions } = optionsResponse as {
          actions: { GET?: Record<string, unknown>; POST?: Record<string, unknown> };
        };
        delete actions.POST;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return cy.intercept('OPTIONS', awxAPI`/notification_templates`, {
          ...optionsResponse,
          actions,
        });
      });
      cy.mount(<Notifiers />);
      cy.contains(/^You do not have permission to create notifiers.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains(/^Create notifier$/).should('not.exist');
    });
  });
});
