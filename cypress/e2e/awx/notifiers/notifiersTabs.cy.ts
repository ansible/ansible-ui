import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { cyLabel } from '../../../support/cyLabel';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';
import { testDelete, testNotification } from './notifiersSharedFunctions';

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

describe('Notifications', () => {
  let awxOrganization: Organization;

  before(() => {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Notifications: Details View', () => {
    beforeEach(() => {
      // reloading page so the notifications dissapears
      cy.reload();
    });

    it('can edit a Notification on its details page and assert the edited info', () => {
      cy.navigateTo('awx', 'notification-templates');
      testNotification('Email', { details: true, skipMessages: true });
    });

    it('can test the Notification on its details page and assert that the test completed', () => {
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
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
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.filterTableByMultiSelect('name', [notificationName]);
        cy.get('[data-cy="name-column-cell"] a').click();
        testDelete(notificationName, { details: true });
      });
    });
  });

  cyLabel(['upstream'], () => {
    describe('Notifications Tab for Organizations', () => {
      it('can navigate to the Organizations -> Notifications list and then to the details page of the Notification', () => {
        const notificationName = randomE2Ename();
        cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
          moveToNotification('organizations', awxOrganization.name, notificationName);
        });
      });

      it('can toggle the Organizations -> Notification on and off for job approval', () => {
        testToggle(
          'organizations',
          awxOrganization.name,
          'Click to enable approval',
          'Click to disable approval',
          awxOrganization
        );
      });

      it('can toggle the Organizations -> Notification on and off for job start', () => {
        testToggle(
          'organizations',
          awxOrganization.name,
          'Click to enable start',
          'Click to disable start',
          awxOrganization
        );
      });

      it('can toggle the Organizations -> Notification on and off for job success', () => {
        testToggle(
          'organizations',
          awxOrganization.name,
          'Click to enable success',
          'Click to disable success',
          awxOrganization
        );
      });

      it('can toggle the Organizations -> Notification on and off for job failure', () => {
        testToggle(
          'organizations',
          awxOrganization.name,
          'Click to enable failure',
          'Click to disable failure',
          awxOrganization
        );
      });
    });
  });

  //Tests for Notifications Tab for Management Jobs live in the management-jobs.cy.ts spec file
  //Tests for Notifications Tab for Projects live in the projects.cy.ts
  //Tests for Notifications Tab for Job Templates live in the jobTemplates.cy.ts spec file
  //Tests for Notifications Tab for Workflow Job Templates live in the workflowJobTemplates.cy.ts spec file

  function testToggle(
    type: string,
    typeEntityName: string,
    type_enable: string,
    type_disable: string,
    awxOrganization: Organization
  ) {
    const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
      moveToNotificationList(type, typeEntityName);
      filterNotification(notificationName);
      cy.get(`[aria-label="${type_enable}"]`).click();

      // reload page to check if the toggle is working and try to disable it
      cy.get(`[aria-label="${type_disable}"]`, { timeout: 5000 }).click();

      // check if it is disabled again
      cy.get(`[aria-label="${type_enable}"]`, { timeout: 5000 });
    });
  }

  // move to notification details page
  // type - organization, workflow job templates, etc.
  // typeEntityName - name of the resource
  // notificationName - name of the notification
  function moveToNotification(type: string, typeEntityName: string, notificationName: string) {
    moveToNotificationList(type, typeEntityName);
    // this may need to change in UIX, now UIX has obsolete filter
    //cy.filterTableByMultiSelect('name', [notificationName]);
    filterNotification(notificationName);
    cy.get('[data-cy="name-column-cell"] a').click();
    cy.contains(notificationName);
  }

  function filterNotification(notificationName: string) {
    cy.get(`[aria-label="Type to filter"]`).type(notificationName);
    cy.getByDataCy(`apply-filter`).click();
    cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
  }

  // move to notification list page
  // type - organization, workflow job templates or such
  // typeEntityName - name of the organization, or other type
  function moveToNotificationList(type: string, typeEntityName: string) {
    cy.navigateTo('awx', type);
    cy.filterTableByMultiSelect('name', [typeEntityName]);
    cy.get('[data-cy="name-column-cell"] a').click();
    cy.contains(typeEntityName);
    cy.contains(`a[role="tab"]`, 'Notifications').click();
  }
});
