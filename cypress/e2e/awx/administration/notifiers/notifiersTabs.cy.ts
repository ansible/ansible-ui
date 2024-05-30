import { randomE2Ename } from '../../../../support/utils';
import { awxAPI } from '../../../../../frontend/awx/common/api/awx-utils';
import { testNotification, testDelete } from './notifiersSharedFunctions';
import { filter } from 'cypress/types/bluebird';
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

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

    beforeEach(() => {
      // reloading page so the notifications dissapears
      cy.reload();
    });

    it('can edit a Notification on its details page and assert the edited info', () => {
      //Utilize the creation of notification in a beforeEach block
      //Assert the initial info of the notification before edit
      //Assert the info of the notification after edit
      //Add an afterEach block to delete the notification that was created for this test
      cy.navigateTo('awx', 'notification-templates');

      // test for only one type should be enough, other types covered in notifiers list view
      testNotification('Email', { details: true, skipMessages: true });
    });

    it('can test the Notification on its details page and assert that the test completed', () => {
      //Utilize a notification of any type created in the beforeEach hook
      //Assert the existence of the notification before test
      //Assert the test action and the fact that it is happening from the details view
      //Assert the behavior in the UI following the test action
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.filterTableByMultiSelect('name', [notificationName]);
        cy.get('[data-cy="name-column-cell"] a').click();

        // test fail message
        cy.getByDataCy('test-notifier').click();

        cy.contains(`[data-cy="status"]`, 'Failed', { timeout: 100000 });

        // test success message
        cy.intercept(awxAPI`/notification_templates/*`, (req) => {
          req.reply((res) => {
            res?.body?.summary_fields?.recent_notifications?.forEach(
              (notification: { status: string }) => {
                if (notification.status === 'failed') {
                  notification.status = 'successful';
                }
              }
            );
            return res;
          });
        }).as('getTemplates');

        cy.getByDataCy('test-notifier').click({ force: true });

        cy.contains(`[data-cy="status"]`, 'Success', { timeout: 100000 });
      });
    });

    it('can delete the Notification on its details page and assert deletion', () => {
      //Utilize notification created in the beforeEach block
      //Assert the presence of the item before deletion
      //Assert the deletion

      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.filterTableByMultiSelect('name', [notificationName]);
        cy.get('[data-cy="name-column-cell"] a').click();

        testDelete(notificationName, { details: true });
      });
    });
  });

  describe('Notifications Tab for Organizations', () => {
    //This describe block should create an Organization to use in these tests
    //The Organization needs to be deleted after the tests run
    const orgName = randomE2Ename();

    before(() => {
      cy.createAwxOrganization(orgName).then(() => {});
    });

    it('can navigate to the Organizations -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the navigation to the details page of the notification

        const notificationName = randomE2Ename();
        cy.createNotificationTemplate(notificationName).then(() => {
          moveToNotification(orgName, notificationName);
        });
    });

    it.only('can toggle the Organizations -> Notification on and off for job approval', () => {
      //Assert the navigation to the notifications tab of the organization
      //Assert the approval toggling on
      //Assert the approval toggling off
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName).then(() => {
       testToggle(orgName, notificationName, 'Click to enable approval');
      });
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
    //These tests live in the management-jobs.cy.ts spec file
  });

  describe('Notifications Tab for Projects', () => {
    //These tests live in the projects.cy.ts
  });

  describe('Notifications Tab for Job Templates', () => {
    //These tests live in the jobTemplates.cy.ts spec file
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

function testToggle(orgName : string, notificationName : string, type : string)
{
  moveToOrganizationNotificationList(orgName);
  filterNotification(notificationName);

  cy.get(`[aria-label="${type}"]`).click();
}

function moveToNotification(orgName : string, notificationName : string)
{
  moveToOrganizationNotificationList(orgName);
  // this may need to change in UIX, now UIX has obsolete filter
  //cy.filterTableByMultiSelect('name', [notificationName]);
  filterNotification(notificationName);
  cy.get('[data-cy="name-column-cell"] a').click();
  cy.contains(notificationName);
}

function filterNotification(notificationName : string)
{
  cy.get(`[aria-label="Type to filter"]`).type(notificationName);
  cy.getByDataCy(`apply-filter`).click();
}

function moveToOrganizationNotificationList(orgName : string)
{
  cy.navigateTo('awx', 'organizations');
  cy.filterTableByMultiSelect('name', [orgName]);
  cy.get('[data-cy="name-column-cell"] a').click();
  cy.contains(orgName);
  cy.contains(`a[role="tab"]`, 'Notifications').click();
}
