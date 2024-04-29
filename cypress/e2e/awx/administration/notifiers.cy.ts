import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../support/utils';

describe('Notifications', () => {
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

  describe('Notifications: List View', () => {
    //The following create notification tests can be written in a loop style, referencing an array of objects, to help
    //minimize the lines of code written.
    //Assert the type of notification created
    //Assert the info on the details screen of the notification
    //Assert the deletion of the notification
    it.skip('can create a new Email Notification, assert the info in the list view, and delete the notification', () => {});
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

  describe('Notifications: Details View', () => {
    it.skip('can edit a Notification on its details page and assert the edited info', () => {
      //Utilize the creation of notification in a beforeEach block
      //Assert the initial info of the notification before edit
      //Assert the info of the notification after edit
      //Add an afterEach block to delete the notification that was created for this test
    });

    it.skip('can test the Notification on its details page and assert that the test completed', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before test
      //Assert the test action and the fact that it is happening from the details view
      //Assert the behavior in the UI following the test action
    });

    it.skip('can delete the Notification on its details page and assert deletion', () => {
      //Utilize notification created in the beforeEach block
      //Assert the presence of the item before deletion
      //Assert the deletion
    });
  });

  describe('Notifications Tab for Organizations', () => {
    //This describe block should create an Organization to use in these tests
    //The Organization needs to be deleted after the tests run

    it.skip('can navigate to the Organizations -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Organizations -> Notification on and off for job approval', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the approval toggling on
      //Assert the approval toggling off
    });

    it.skip('can toggle the Organizations -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Organizations -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Organizations -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });

  describe('Notifications Tab for Management Jobs', () => {
    //These tests live in the management-jobs spec file
  });

  describe('Notifications Tab for Projects', () => {
    //This describe block should create a Project to use in these tests
    //The Project needs to be deleted after the tests run

    it.skip('can navigate to the Projects -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Projects -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Projects -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Projects -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });

  describe('Notifications Tab for Job Templates', () => {
    //This describe block should create a Job Template to use in these tests
    //The Job Template needs to be deleted after the tests run

    it.skip('can navigate to the Job Templates -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Job Templates -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Job Templates -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Job Templates -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });

  describe('Notifications Tab for Workflow Job Templates', () => {
    //This describe block should create a Workflow Job Template to use in these tests
    //The Workflow Job Template needs to be deleted after the tests run

    it.skip('can navigate to the Workflow Job Templates -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Workflow Job Template
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Workflow Job Templates -> Notification on and off for job approval', () => {
      //Assert the navigation to the notifications tab of the Workflow Job Template
      //Assert the approval toggling on
      //Assert the approval toggling off
    });

    it.skip('can toggle the Workflow Job Templates -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Workflow Job Template
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Workflow Job Templates -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Workflow Job Template
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Workflow Job Templates -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Workflow Job Template
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });
});
