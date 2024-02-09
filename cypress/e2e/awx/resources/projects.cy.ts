/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { User } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

// These tests do not modify the project, thus can use the globalProject
describe('projects', () => {
  before(function () {
    cy.awxLogin();
  });

  it('can render the projects list page', function () {
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
  });

  it('create project and then delete project from project details page', function () {
    const projectName = 'E2E Project ' + randomString(4);
    cy.navigateTo('awx', 'projects');
    cy.clickLink(/^Create project$/);
    cy.get('[data-cy="name"]').type(projectName);
    cy.selectSingleSelectOption(
      '[data-cy="organization"]',
      `${(this.globalOrganization as Organization).name}`
    );
    cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
    cy.get('[data-cy="scm-url"]').type('https://github.com/ansible/ansible-ui');
    cy.get('[data-cy="option-allow-override"]').click();
    cy.clickButton(/^Create project$/);
    cy.verifyPageTitle(projectName);
    cy.hasDetail(/^Organization$/, `${(this.globalOrganization as Organization).name}`);
    cy.hasDetail(/^Source control type$/, 'Git');
    cy.hasDetail(/^Enabled options$/, 'Allow branch override');
    cy.clickPageAction('delete-project');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.verifyPageTitle('Projects');
  });

  it('can navigate to project details tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickLink(/^Details$/);
    cy.get('#name').should('contain', `${(this.globalProject as Project).name}`);
  });

  it('can navigate to project access tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Access$/, true);
  });

  it('can navigate to project job templates tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Job templates$/, true);
  });

  it('can navigate to project notifications tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Notifications$/, true);
  });

  it('can navigate to project schedules tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Schedules$/, true);
  });
});

describe('project edit and delete tests', () => {
  let project: Project;
  let organization: Organization;
  let user: User;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
        cy.createAwxProject({ organization: organization.id }).then((proj) => {
          project = proj;
          cy.giveUserProjectAccess(project.name, user.id, 'Read');
        });
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can sync project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${project.name}`);
    cy.verifyPageTitle(`${project.name}`);
    cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
    cy.clickButton(/^Sync project$/);
    cy.wait('@projectUpdateRequest');
  });

  it('can edit a project from the project details tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickButton(/^Edit project$/);
    cy.verifyPageTitle('Edit Project');
    cy.get('[data-cy="name"]').clear().type(`${project.name} - edited`);
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(`${project.name} - edited`);
    cy.clickButton(/^Edit project$/);
    cy.get('[data-cy="name"]').clear().type(`${project.name}`);
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(project.name);
  });

  it('can sync project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByText(`${project.name}`);
    cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
    cy.contains('td', `${project.name}`)
      .parent()
      .within(() => {
        cy.get('#sync-project').click();
      });
    cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
    cy.wait('@projectUpdateRequest');
  });

  it('can edit a project from the project list row action', () => {
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(project.name);
    cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
      cy.get('[data-cy="edit-project"]').click();
    });
    cy.verifyPageTitle('Edit Project');
    cy.get('[data-cy="name"]').clear().type(`${project.name} - edited`);
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(`${project.name} - edited`);
    cy.clickButton(/^Edit project$/);
    cy.get('[data-cy="name"]').clear().type(`${project.name}`);
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(project.name);
  });

  it('can copy project from project details page', function () {
    const endOfProject = project.name.split(' ').slice(-1).toString();
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(endOfProject);
    cy.get('[data-cy="page-title"]').should('contain', 'Projects');
    cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
      cy.get('[data-cy="name-column-cell"]').click();
    });
    cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
    cy.get('[data-cy="actions-dropdown"]')
      .click()
      .then(() => {
        cy.get('[data-cy="copy-project"]').click();
      });
    cy.wait('@copiedProject')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eq(201);
        cy.get('[data-cy="Projects"]').eq(1).click();
        cy.intercept(
          'GET',
          awxAPI`/projects/?name__icontains=${endOfProject}&order_by=name&page=1&page_size=10`
        ).as('searchResults');
        cy.searchAndDisplayResource(endOfProject);
        cy.wait('@searchResults')
          .its('response.body.count')
          .then((response) => {
            expect(response).to.equal(2);
          });
        cy.clickButton(/^Clear all filters$/);
      });
  });

  it('can copy project from projects list table row kebab menu', function () {
    const endOfProject = project.name.split(' ').slice(-1).toString();
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(endOfProject);
    cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
    cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
      cy.get('[data-cy="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get('[data-cy="copy-project"]').click();
        });
    });
    cy.wait('@copiedProject')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eq(201);
        cy.intercept(
          'GET',
          awxAPI`/projects/?or__name__icontains=${endOfProject}&or__name__icontains=${endOfProject}&order_by=name&page=1&page_size=10`
        ).as('searchResults');
        cy.searchAndDisplayResource(endOfProject);
        cy.wait('@searchResults')
          .its('response.body.count')
          .then((response) => {
            expect(response).to.equal(2);
          });
        cy.clickButton(/^Clear all filters$/);
      });
  });

  it('can delete project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRowKebabAction(`${project.name}`, 'delete-project');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(`${project.name}`).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list table row kebab menu', () => {
  //   cy.requestPost<Project>(awxAPI`/projects/`, {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'https://github.com/ansible/ansible-ui',
  //   }).then((testProject) => {
  //     cy.navigateTo('awx', 'projects');
  //     cy.filterTableByText(testProject.name);
  //     cy.contains('td', testProject.name)
  //       .parent()
  //       .within(() => {
  //         cy.get('#cancel-sync').click();
  //       });
  //     cy.get('#confirm').click();
  //     cy.clickButton(/^Cancel project sync/);
  //     cy.contains(/^Success$/);
  //     cy.clickButton(/^Close$/);
  //     cy.filterTableByText(testProject.name);
  //     cy.get('td[data-label="Status"]').should('contain', 'Canceled');
  //     cy.clickButton(/^Clear all filters$/);
  //     cy.deleteAwxProject(testProject);
  //   });
  // });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list toolbar ', () => {
  //   cy.requestPost<Project>(awxAPI`/projects/`, {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'https://github.com/ansible/ansible-ui',
  //   }).then((testProject) => {
  //     cy.navigateTo('awx', 'projects');
  //     cy.selectTableRow(testProject.name);
  //     cy.clickToolbarKebabAction('cancel-selected-projects');
  //     cy.get('#confirm').click();
  //     cy.clickButton(/^Cancel project sync/);
  //     cy.contains(/^Success$/);
  //     cy.clickButton(/^Close$/);
  //     cy.filterTableByText(testProject.name);
  //     cy.get('td[data-label="Status"]').should('contain', 'Canceled');
  //     cy.clickButton(/^Clear all filters$/);
  //   });
  // });

  it('can delete project from projects list toolbar ', function () {
    const endOfProject = project.name.split(' ').slice(-1).toString();
    cy.navigateTo('awx', 'projects');
    cy.selectTableRow(`${project.name}`);
    cy.clickToolbarKebabAction('delete-selected-projects');
    cy.get('#confirm').click();
    cy.get('button[data-ouia-component-id="submit"]').click();
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(`${endOfProject}`).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can delete project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${project.name}`);
    cy.get('[data-cy="page-title"]').should('contain', `${project.name}`);
    cy.clickPageAction('delete-project');
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.intercept('DELETE', awxAPI`/projects/${project.id.toString()}/`).as('deleted');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.wait('@deleted');
    });
    cy.getTableRowByText(`${project.name}`).should('not.exist');
    cy.verifyPageTitle('Projects');
  });
});
