import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../support/utils';

describe('notifiers', () => {
  before(() => {
    cy.awxLogin();
  });

  it('renders the notifier page', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.verifyPageTitle('Notifiers');
  });
});

describe('notifiers copy and delete', () => {
  let notificationTemplate: NotificationTemplate;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName).then((testNotification) => {
      notificationTemplate = testNotification;
    });
  });

  it('copies a notifier from the list view', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.getByDataCy('copy-notifier').click();
    });
    cy.get('[data-cy="alert-toaster"]').contains('copied').should('be.visible');
    cy.clickButton(/^Clear all filters/);
    cy.deleteNotificationTemplate(notificationTemplate, { failOnStatusCode: false });
    cy.filterTableByMultiSelect('name', [`${notificationTemplate.name} @`]);
    cy.get('[data-cy="checkbox-column-cell"]').within(() => {
      cy.get('input').click();
    });
    cy.clickToolbarKebabAction('delete-selected-notifiers');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Delete notifiers/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });

  it('deletes a notifier from the list row item', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.clickKebabAction('actions-dropdown', 'delete-notifier');
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete notifiers/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('deletes a notifier from the toolbar', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.get('[data-cy="checkbox-column-cell"]').within(() => {
      cy.get('input').click();
    });
    cy.clickToolbarKebabAction('delete-selected-notifiers');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Delete notifiers/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });
});
