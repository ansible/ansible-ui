import { randomString } from '../../../../../framework/utils/random-string';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../../support/utils';

describe('Organizations: Create', () => {
  it('can create a basic organization, assert info on the details page, and delete it', () => {
    const organizationName = randomE2Ename();
    const orgDescription = 'orgDescription' + randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.verifyPageTitle('Organizations');
    cy.clickLink(/^Create organization$/);
    cy.getByDataCy('name').type(organizationName);
    cy.getByDataCy('description').type(orgDescription);
    cy.intercept('POST', awxAPI`/organizations/`).as('newOrg');
    cy.clickButton(/^Create organization$/);
    cy.wait('@newOrg')
      .its('response.body')
      .then((response: Organization) => {
        cy.intercept('GET', awxAPI`/organizations/${response.id.toString()}/`).as('createdOrg');
        cy.wait('@createdOrg');
        cy.getByDataCy('Details').should('be.visible');
        cy.verifyPageTitle(response.name);
        cy.getByDataCy('id').should('contain', response.id);
        cy.getByDataCy('name').should('contain', response.name);
        cy.getByDataCy('description').should('contain', response?.description);
        cy.clickPageAction('delete-organization');
        cy.get('#confirm').click();
        cy.intercept('DELETE', awxAPI`/organizations/${response.id.toString()}/`).as('delete');
        cy.clickButton(/^Delete organization/);
        cy.wait('@delete')
          .its('response.statusCode')
          .then((statusCode) => {
            expect(statusCode).to.eql(204);
            cy.verifyPageTitle('Organizations');
          });
      });
  });
});

describe('Organizations: Edit and Delete', function () {
  let organization: Organization;
  let user: AwxUser;

  beforeEach(function () {
    const orgName = randomE2Ename();
    cy.createAwxOrganization({ name: orgName }).then((testOrganization) => {
      organization = testOrganization;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
        cy.giveUserOrganizationAccess(organization.name, user.id, 'Read');
      });
    });
  });

  afterEach(function () {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can edit an organization from the list view', function () {
    const stringRandom = randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.getByDataCy('edit-organization').click();
    });
    cy.verifyPageTitle(`Edit ${organization.name}`);
    cy.getByDataCy('name')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle('now-edited ' + `${stringRandom}`);
    cy.getByDataCy('edit-organization').click();
    cy.getByDataCy('name').clear().type(`${organization.name}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle(`${organization.name}`);
  });

  it('can edit an organization from the details page', function () {
    const stringRandom = randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(`${organization.name}`);
    cy.containsBy('button', /^Edit organization/).click();
    cy.verifyPageTitle(`Edit ${organization.name}`);
    cy.getByDataCy('name')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.containsBy('button', /^Save organization/).click();
    cy.verifyPageTitle(`${organization.name}`);
    cy.getByDataCy('edit-organization').click();
    cy.getByDataCy('name').clear().type(`${organization.name}`);
    cy.containsBy('button', /^Save organization/).click();
    cy.verifyPageTitle(`${organization.name}`);
  });

  it('can delete an organization from the details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(organization.name);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/organizations/${organization.id.toString()}`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Organizations');
      });
  });

  it('can delete an organization from the organizations list row item', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.clickKebabAction('actions-dropdown', 'delete-organization');
    });
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/organizations/${organization.id.toString()}`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.verifyPageTitle('Organizations');
      });
  });

  it('can delete an organization from the organizations list toolbar', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.selectTableRow(organization.name, false);
    cy.clickToolbarKebabAction('delete-organizations');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/organizations/${organization.id.toString()}`).as('delete');
      cy.clickButton(/^Delete organization/);
      cy.wait('@delete')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
        });
    });
    cy.verifyPageTitle('Organizations');
  });
});

describe('Organizations: Users Tab', function () {
  let organization: Organization;
  let user: AwxUser;

  beforeEach(function () {
    const orgName = randomE2Ename();
    cy.createAwxOrganization({ name: orgName }).then((testOrganization) => {
      organization = testOrganization;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
        cy.giveUserOrganizationAccess(organization.name, user.id, 'Read');
      });
    });
  });

  afterEach(function () {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it.skip('can add a brand new normal user to the Org', () => {});
  it.skip('can add a brand new auditor user to the Org', () => {});
  it.skip('can bulk remove users from the users tab of an Org', () => {});
});

describe('Organizations: Teams Tab', function () {
  let organization: Organization;
  let user: AwxUser;
  beforeEach(function () {
    const orgName = randomE2Ename();
    cy.createAwxOrganization({ name: orgName }).then((testOrganization) => {
      organization = testOrganization;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
        cy.giveUserOrganizationAccess(organization.name, user.id, 'Read');
      });
    });
  });

  afterEach(function () {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it.skip('can edit a team from the teams tab inside of an Org', () => {});
});

describe('Notifications Tab for Organizations', () => {
  let awxOrganization: Organization;

  before(() => {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

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
      cy.get(`[aria-label="${type_disable}"]`, { timeout: 5000 }).click();
      cy.get(`[aria-label="${type_enable}"]`, { timeout: 5000 });
    });
  }

  //Search by notification name and click to visit details page
  function moveToNotification(type: string, typeEntityName: string, notificationName: string) {
    moveToNotificationList(type, typeEntityName);
    filterNotification(notificationName);
    cy.get('[data-cy="name-column-cell"] a').click();
    cy.contains(notificationName);
  }

  function filterNotification(notificationName: string) {
    cy.get(`[aria-label="Type to filter"]`).type(notificationName);
    cy.getByDataCy(`apply-filter`).click();
    cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
  }

  //Navigate to Notifiers List View -> Type resource name -> Click on resource
  function moveToNotificationList(type: string, typeEntityName: string) {
    cy.navigateTo('awx', type);
    cy.filterTableByMultiSelect('name', [typeEntityName]);
    cy.get('[data-cy="name-column-cell"] a').click();
    cy.contains(typeEntityName);
    cy.contains(`a[role="tab"]`, 'Notifications').click();
  }
});
