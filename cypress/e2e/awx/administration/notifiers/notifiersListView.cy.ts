import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../../support/utils';
import { testNotification } from './notifiersSharedFunctions';

describe('Notifications: List View', () => {
  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    // TODO - this will be useful for editing
    /*const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName).then((testNotification) => {
      notificationTemplate = testNotification;
    });*/
  });

  //The following create notification tests can be written in a loop style, referencing an array of objects, to help
  //minimize the lines of code written.
  //Assert the type of notification created
  //Assert the info on the details screen of the notification
  //Assert the deletion of the notification

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

  //The following edit notification tests can be written in a loop style, referencing an array of objects, to help
  //minimize the lines of code written.
  //Utilize the creation of notifications in a beforeEach block
  //Assert the initial info of the notification before edit
  //Assert the info of the notification after edit
  //Add an afterEach block to delete the notifications that were created for these tests

  // skipping, covered above
  /*it.skip('can edit a new Email Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Grafana Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a IRC Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Mattermost Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Pagerduty Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Rocket.Chat Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Slack Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Twilio Notification and assert the edited info in the list view', () => {});
  it.skip('can edit a Webhook Notification and assert the edited info in the list view', () => {});*/

  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  it('can test a Notification and assert the successful test in the list view', () => {
    //Utilize a notification of any type created in the beforeEach hook
    //Assert the existence of the notification before test
    //Assert the test action and the fact that it is happening from the list view
    //Assert the behavior in the UI following the test action
    const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName).then((notificationTemplate) => {
      cy.navigateTo('awx', 'notification-templates');
      cy.filterTableByMultiSelect('name', [notificationTemplate.name]);

      // test fail message
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('test-notifier').click();
      });

      cy.contains(`[data-cy="status-column-cell"]`, 'Failed', { timeout: 100000 });

      cy.intercept(awxAPI`/notification_templates/?name=${notificationName}*`, (req) => {
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
    //Utilize a notification of any type created in the beforeEach hook
    //Assert the existence of the notification before copy
    //Assert the copy action
    //Assert the existence of the copied notification as well as the original
    const name = randomE2Ename();
    cy.createNotificationTemplate(name).then((notificationTemplate) => {
      cy.navigateTo('awx', 'notification-templates');
      cy.filterTableByMultiSelect('name', [name]);

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
  });

  it('can bulk delete a Notification and assert deletion', () => {
    //Utilize notification created in the beforeEach block
    //create an additional notification in this test for the purposes of bulk delete
    //Assert the presence of the items before deletion
    //Assert the deletion

    const name1 = randomE2Ename();
    const name2 = randomE2Ename();

    cy.createNotificationTemplate(name1).then(() => {
      cy.createNotificationTemplate(name2).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.filterTableByMultiSelect('name', [name1, name2]);
        cy.get('[data-cy="checkbox-column-cell"]')
          .eq(0)
          .within(() => {
            cy.get('input').click();
          });
        cy.get('[data-cy="checkbox-column-cell"]')
          .eq(1)
          .within(() => {
            cy.get('input').click();
          });
        cy.clickToolbarKebabAction('delete-selected-notifiers');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.clickButton(/^Delete notifiers/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
        });
        cy.contains('No results found');
        cy.contains(name1).should('not.exist');
        cy.contains(name2).should('not.exist');
      });
    });
  });
});
