import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';
import { testNotification } from './notifiersSharedFunctions';
import { NotificationTemplate } from '@ansible/awx-ui/interfaces/NotificationTemplate';

describe('Notifications: List View', () => {
  let organization: Organization;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
  });

  it('can create, edit a new Email Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Email');
  });

  it('can create a new Grafana Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Grafana');
  });

  it('can create, edit a new IRC Notification in the AAP UI, assert the info in the list view, and delete the notification', () => {
    testNotification('IRC');
  });

  it('can create, edit a new Mattermost Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Mattermost');
  });

  it('can create, edit a new Pagerduty Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Pagerduty');
  });

  it('can create, edit a new Rocket.Chat Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Rocket.Chat');
  });

  it('can create, edit a new Slack Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Slack');
  });

  it('can create, edit a new Twilio Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Twilio');
  });

  it('can create, edit a new Webhook Notification, assert the info in the list view, and delete the notification', () => {
    testNotification('Webhook');
  });

  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  it('can test a Notification and assert the successful test in the list view', () => {
    const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName, organization).then((notificationTemplate) => {
      cy.navigateTo('awx', 'notification-templates');
      cy.intercept('GET', awxAPI`/notification_templates/?search*`).as('search');
      cy.filterTableBySearch(notificationTemplate.name);
      cy.wait('@search');
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('test-notifier').click();
      });
      cy.contains(`[data-cy="status-column-cell"]`, 'Failed', { timeout: 100000 });
      cy.intercept(awxAPI`/notification_templates/?search=${notificationName}*`, (req) => {
        req.reply((res) => {
          res.body?.results?.[0]?.summary_fields?.recent_notifications?.forEach(
            (notification: { status: string }) => {
              if (notification.status === 'failed') {
                notification.status = 'successful';
              }
            }
          );
          return res;
        });
      }).as('getTemplates');
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('test-notifier').click();
      });
      cy.contains(`[data-cy="status-column-cell"]`, 'Success', { timeout: 100000 });
    });
  });

  it('can copy a Notification and assert that the copy action completed successfully', () => {
    const name = randomE2Ename();
    cy.createNotificationTemplate(name, organization).then((notificationTemplate) => {
      cy.navigateTo('awx', 'notification-templates');
      cy.intercept('GET', awxAPI`/notification_templates/?search*`).as('search');
      cy.filterTableBySearch(name);
      cy.wait('@search');
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('actions-dropdown').click();
      });
      cy.getByDataCy('copy-notifier').click();
      cy.get('[data-cy="alert-toaster"]').contains('copied').should('be.visible');
      cy.clickButton(/^Clear all filters/);
      cy.deleteNotificationTemplate(notificationTemplate, { failOnStatusCode: false });
      cy.filterTableBySearch(`${notificationTemplate.name} @`);
      cy.verifyPageTitle('Notifiers');
      cy.wait('@search');
      cy.selectTableRow(`${notificationTemplate.name} @`);
      cy.clickToolbarKebabAction('delete-notifiers');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete notifiers/);
        cy.contains(/^Success$/);
      });
    });
  });

  it('can bulk delete a Notification and assert deletion', () => {
    let name1: NotificationTemplate;
    let name2: NotificationTemplate;

    cy.createNotificationTemplate(randomE2Ename(), organization).then((notifier) => {
      name1 = notifier;
      cy.createNotificationTemplate(randomE2Ename(), organization).then((notifier) => {
        name2 = notifier;
        cy.navigateTo('awx', 'notification-templates');
        cy.intercept('GET', awxAPI`/notification_templates/?search*`).as('search');
        cy.filterTableBySearch(name1.name);
        cy.wait('@search');
        cy.get('[data-cy="checkbox-column-cell"]').within(() => {
          cy.get('input').click();
        });
        cy.clickButton('Clear all filters');
        cy.filterTableBySearch(name2.name);
        cy.wait('@search');
        cy.get('[data-cy="checkbox-column-cell"]').within(() => {
          cy.get('input').click();
        });
        cy.clickToolbarKebabAction('delete-notifiers');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.clickButton(/^Delete notifiers/);
          cy.contains(/^Success$/);
        });
        cy.clickButton('Clear all filters');
        cy.contains(name1.name).should('not.exist');
        cy.contains(name2.name).should('not.exist');
      });
    });
  });
});
