import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

describe('organizations', () => {
  before(() => {
    cy.awxLogin();
  });

  it('renders the organizations list page', () => {
    cy.navigateTo('awx', 'organizations');
    cy.verifyPageTitle('Organizations');
  });

  it('creates and then deletes a basic organization', () => {
    const organizationName = randomE2Ename();
    cy.navigateTo('awx', 'organizations');
    cy.clickLink(/^Create organization$/);
    cy.getByDataCy('organization-name').type(organizationName);
    cy.clickButton(/^Create organization$/);
    cy.verifyPageTitle(organizationName);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/organizations/*`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
    cy.verifyPageTitle('Organizations');
  });

  it('renders the organization details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [(this.globalOrganization as Organization).name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(`${(this.globalOrganization as Organization).name}`);
    cy.clickLink(/^Details$/);
    cy.contains('#name', `${(this.globalOrganization as Organization).name}`);
  });
});

describe('organizations edit and delete', function () {
  let organization: Organization;
  let user: AwxUser;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    const orgName = randomE2Ename();
    cy.createAwxOrganization(orgName).then((testOrganization) => {
      organization = testOrganization;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
        cy.giveUserOrganizationAccess(organization.name, user.id, 'Read');
      });
    });
  });

  afterEach(function () {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('edits an organization from the list view', function () {
    const stringRandom = randomString(4);
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.getByDataCy('edit-organization').click();
    });
    cy.verifyPageTitle('Edit Organization');
    cy.getByDataCy('organization-name')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle('now-edited ' + `${stringRandom}`);
    cy.getByDataCy('edit-organization').click();
    cy.getByDataCy('organization-name').clear().type(`${organization.name}`);
    cy.clickButton(/^Save organization$/);
    cy.verifyPageTitle(`${organization.name}`);
  });

  it('edits an organization from the details page', function () {
    const stringRandom = randomString(4);

    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(`${organization.name}`);

    cy.containsBy('button', /^Edit organization/).click();
    cy.verifyPageTitle('Edit Organization');
    cy.getByDataCy('organization-name')
      .clear()
      .type('now-edited ' + `${stringRandom}`);
    cy.containsBy('button', /^Save organization/).click();

    cy.verifyPageTitle('now-edited ' + `${stringRandom}`);
    cy.getByDataCy('edit-organization').click();
    cy.getByDataCy('organization-name').clear().type(`${organization.name}`);
    cy.containsBy('button', /^Save organization/).click();

    cy.verifyPageTitle(`${organization.name}`);
  });

  it('deletes an organization from the details page', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(organization.name);
    cy.clickPageAction('delete-organization');
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/organizations/*`).as('delete');
    cy.clickButton(/^Delete organization/);
    cy.wait('@delete');
    cy.verifyPageTitle('Organizations');
  });

  it('deletes an organization from the organizations list row item', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.getByDataCy('actions-column-cell').within(() => {
      cy.clickKebabAction('actions-dropdown', 'delete-organization');
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('deletes an organization from the organizations list toolbar', function () {
    cy.navigateTo('awx', 'organizations');
    cy.filterTableByMultiSelect('name', [organization.name]);
    cy.get('[data-cy="checkbox-column-cell"]').within(() => {
      cy.get('input').click();
    });
    cy.clickToolbarKebabAction('delete-selected-organizations');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Delete organization/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });
});
