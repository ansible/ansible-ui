import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../support/utils';

describe('notifications', () => {
  before(() => {
    cy.awxLogin();
  });

  it('renders the notification list page', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.verifyPageTitle('Notifications');
  });
});

describe('notifications copy and delete', () => {
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

  it('copies a notification from the list view', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.getByDataCy('copy-notification-template').click();
    });
    cy.get('[data-cy="alert-toaster"]').contains('copied').should('be.visible');
    cy.clickButton(/^Clear all filters/);
    cy.deleteNotificationTemplate(notificationTemplate, { failOnStatusCode: false });
    cy.filterTableByMultiSelect('name', [`${notificationTemplate.name} @`]);
    cy.get('[data-cy="checkbox-column-cell"]').within(() => {
      cy.get('input').click();
    });
    cy.clickToolbarKebabAction('delete-selected-notifications');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Delete notifications/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });

  it('deletes a notification from the list row item', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.clickKebabAction('actions-dropdown', 'delete-notification-template');
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete notifications/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('deletes a notification from the toolbar', () => {
    cy.navigateTo('awx', 'notification-templates');
    cy.filterTableByMultiSelect('name', [notificationTemplate.name]);
    cy.get('[data-cy="checkbox-column-cell"]').within(() => {
      cy.get('input').click();
    });
    cy.clickToolbarKebabAction('delete-selected-notifications');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Delete notifications/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });
});
