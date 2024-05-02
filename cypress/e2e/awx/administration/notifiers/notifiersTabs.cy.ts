import { NotificationTemplate } from '../../../../../frontend/awx/interfaces/NotificationTemplate';
import { randomE2Ename } from '../../../../support/utils';

describe('Notifications', () => {
  //let notificationTemplate: NotificationTemplate;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    /*const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName).then((testNotification) => {
      notificationTemplate = testNotification;
    });*/
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
    //These tests live in projects.cy.ts
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
