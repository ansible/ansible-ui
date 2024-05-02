import { NotificationTemplate } from '../../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../../support/utils';

describe('Notifications: List View', () => {
    let notificationTemplate: NotificationTemplate;

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
    it('can create a new Email Notification, assert the info in the list view, and delete the notification', () => {
        createNotification('Email', false);
    });
    it.skip('can create a new Grafana Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new IRC Notification in the AAP UI, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Mattermost Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Pagerduty Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Rocket.Chat Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Slack Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Twilio Notification, assert the info in the list view, and delete the notification', () => {});
    it.skip('can create a new Webhook Notification, assert the info in the list view, and delete the notification', () => {});

    //The following edit notification tests can be written in a loop style, referencing an array of objects, to help
    //minimize the lines of code written.
    //Utilize the creation of notifications in a beforeEach block
    //Assert the initial info of the notification before edit
    //Assert the info of the notification after edit
    //Add an afterEach block to delete the notifications that were created for these tests
    it.skip('can edit a new Email Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Grafana Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a IRC Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Mattermost Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Pagerduty Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Rocket.Chat Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Slack Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Twilio Notification and assert the edited info in the list view', () => {});
    it.skip('can edit a Webhook Notification and assert the edited info in the list view', () => {});

    it.skip('can test a Notification and assert the successful test in the list view', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before test
      //Assert the test action and the fact that it is happening from the list view
      //Assert the behavior in the UI following the test action
    });

    it.skip('can copy a Notification and assert that the copy action completed successfully', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before copy
      //Assert the copy action
      //Assert the existence of the copied notification as well as the original
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

    it.skip('can bulk delete a Notification and assert deletion', () => {
      //Utilize notification created in the beforeEach block
      //create an additional notification in this test for the purposes of bulk delete
      //Assert the presence of the items before deletion
      //Assert the deletion
    });
  });

  function createNotification(type : string, customizeMessages : boolean)
  {
    const orgName = randomE2Ename();
    cy.createAwxOrganization(orgName).then( () => {
        cy.navigateTo('awx', 'notification-templates');
        cy.get(`[data-cy="add-notifier"]`).click();

        fillBasicData(orgName, type);
    });
  }

  function fillBasicData(orgName : string, type : string)
  {
    const notificationName = randomE2Ename();
    cy.get(`[data-cy="name"]`).type(notificationName);
    cy.get(`[data-cy="description"]`).type('this is test description');
    cy.get(`[data-cy="organization"]`).click();
    cy.contains('button', 'Browse').click();
    cy.selectTableRowByCheckbox('name', orgName);
    cy.contains(`[data-cy="row-id-1"]`, orgName);
    cy.get(`[aria-label="Select row 0"]`).click();
    cy.contains('button', 'Confirm').click();

    cy.contains(`[data-cy="notification_type"]`).click();
    cy.contains('span', type).click();
  }