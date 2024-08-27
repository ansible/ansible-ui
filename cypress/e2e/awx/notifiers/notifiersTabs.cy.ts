import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';
import { testDelete } from './notifiersSharedFunctions';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';

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

    it('can test the Notification on its details page and assert that the test completed', () => {
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.filterTableByMultiSelect('name', [notificationName]);
        cy.get('[data-cy="name-column-cell"] a').click();
        cy.getByDataCy('test-notifier').click();
        cy.contains(`[data-cy="status"]`, 'Failed', { timeout: 100000 });
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

    it('can edit a Notification on its details page and assert the edited info', () => {
      const notificationName = randomE2Ename();
      const orgName = randomE2Ename();
      cy.createAwxOrganization({ name: orgName }).then(() => {
        cy.navigateTo('awx', 'notification-templates');
        cy.get(`[data-cy="create-notifier"]`).click();
        cy.verifyPageTitle('Create notifier');
        cy.get(`[data-cy="name"]`).type(notificationName);
        cy.get(`[data-cy="description"]`).type('this is test description');
        cy.get(`[data-cy="notification_type"]`).click();
        cy.contains('span', 'Email').click();
        cy.get(`[data-cy="notification-configuration-username"]`).type('email user');
        cy.get(`[data-cy="notification-configuration-password"]`).type('email password');
        cy.get(`[data-cy="notification-configuration-host"]`).type('https://host.com');
        cy.get(`[data-cy="notification-configuration-recipients"]`).type(
          'receipient1{enter}receipient2'
        );
        cy.get(`[data-cy="notification-configuration-sender"]`).type('sender@email.com');
        cy.get(`[data-cy="notification-configuration-port"]`).type('80');
        cy.get(`[data-cy="notification-configuration-timeout"]`).type('100');
        cy.get(`[data-cy="notification_configuration-use_tls"]`).click();
        cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
        cy.singleSelectByDataCy('organization', orgName);
        cy.get('[data-cy="customize-messages-toggle"]').parent().find('span').click();
        cy.get(`[data-cy="Submit"]`).click();
        cy.contains(`[data-cy="name"]`, notificationName);
        cy.contains(`[data-cy="description"]`, 'this is test description');
        cy.contains(`[data-cy="notification-type"]`, 'email');
        cy.contains(`[data-cy="organization"]`, orgName);
        cy.contains(`[data-cy="username"]`, 'email user');
        cy.contains(`[data-cy="use-tls"]`, 'true');
        cy.contains(`[data-cy="use-ssl"]`, 'true');
        cy.contains(`[data-cy="host"]`, 'https://host.com');
        cy.contains(`[data-cy="recipient-list"]`, 'receipient1');
        cy.contains(`[data-cy="recipient-list"]`, 'receipient2');
        cy.contains(`[data-cy="sender-email"]`, 'sender@email.com');
        cy.contains(`[data-cy="port"]`, '80');
        cy.contains(`[data-cy="timeout"]`, '100');
        cy.getByDataCy(`edit-notifier`).click();
        cy.get(`[data-cy="name"]`).clear().type(notificationName);
        cy.get(`[data-cy="description"]`).clear().type('this is test description edited');
        cy.get(`[data-cy="notification-configuration-username"]`).clear().type('email user edited');
        cy.get(`[data-cy="notification-configuration-host"]`)
          .clear()
          .type('https://host_edited.com');
        cy.get(`[data-cy="notification-configuration-recipients"]`)
          .clear()
          .type('receipient1{enter}receipient2{enter}receipient3');
        cy.get(`[data-cy="notification-configuration-sender"]`)
          .clear()
          .type('sender@email_edited.com');
        cy.get(`[data-cy="notification-configuration-port"]`).clear().type('100');
        cy.get(`[data-cy="notification-configuration-timeout"]`).clear().type('120');
        cy.get(`[data-cy="notification_configuration-use_tls"]`).click();
        cy.get(`[data-cy="notification_configuration-use_ssl"]`).click();
        cy.get(`[data-cy="Submit"]`).click();
        cy.contains(`[data-cy="description"]`, 'this is test description edited');
        cy.contains(`[data-cy="name"]`, notificationName);
        cy.contains(`[data-cy="organization"]`, orgName);
        cy.contains(`[data-cy="username"]`, 'email user edited');
        cy.contains(`[data-cy="use-tls"]`, 'false');
        cy.contains(`[data-cy="use-ssl"]`, 'false');
        cy.contains(`[data-cy="host"]`, 'https://host_edited.com');
        cy.contains(`[data-cy="recipient-list"]`, 'receipient1');
        cy.contains(`[data-cy="recipient-list"]`, 'receipient2');
        cy.contains(`[data-cy="recipient-list"]`, 'receipient3');
        cy.contains(`[data-cy="sender-email"]`, 'sender@email_edited.com');
        cy.contains(`[data-cy="port"]`, '100');
        cy.contains(`[data-cy="timeout"]`, '120');
        cy.get(`[data-cy="actions-dropdown"]`).click();
        cy.get(`[data-cy="delete-notifier"]`).click();
        cy.get(`[role="dialog"] input`).click();
        cy.contains(`[role="dialog"] button`, `Delete notifiers`).click();
        cy.verifyPageTitle('Notifiers');
        cy.contains('Configure custom notifications to be sent based on predefined events.');
        cy.requestGet<AwxItemsResponse<Notification>>(awxAPI`/notification_templates/?name={name}`)
          .its('results')
          .then((results) => {
            expect(results).to.have.length(0);
          });
      });
    });
  });

  //Tests for Notifications Tab for Organizations live in the organizations.cy.ts
  //Tests for Notifications Tab for Management Jobs live in the management-jobs.cy.ts spec file
  //Tests for Notifications Tab for Projects live in the projects.cy.ts
  //Tests for Notifications Tab for Job Templates live in the jobTemplates.cy.ts spec file
  //Tests for Notifications Tab for Workflow Job Templates live in the workflowJobTemplates.cy.ts spec file
});
