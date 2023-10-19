/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('projects', () => {
  let organization: Organization;
  let project: Project;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject({ organization: organization.id }).then((proj) => {
        project = proj;
      });
    });
  });

  it('can render the projects list page', function () {
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
  });

  it('create project and then delete project from project details page', function () {
    const projectName = 'E2E Project ' + randomString(4);
    cy.navigateTo('awx', 'projects');
    cy.clickLink(/^Create project$/);
    cy.get('[data-cy="project-name"]').type(projectName);
    cy.selectDropdownOptionByResourceName(
      'organization',
      `${(this.globalProjectOrg as Organization).name}`
    );
    cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
    cy.get('[data-cy="project-scm-url"]').type('https://github.com/ansible/ansible-ui');
    cy.get('[data-cy="option-allow-override"]').click();
    cy.clickButton(/^Create project$/);
    cy.verifyPageTitle(projectName);
    cy.hasDetail(/^Organization$/, `${(this.globalProjectOrg as Organization).name}`);
    cy.hasDetail(/^Source control type$/, 'Git');
    cy.hasDetail(/^Enabled options$/, 'Allow branch override');
    cy.clickPageAction(/^Delete project/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.verifyPageTitle('Projects');
  });

  it('can sync project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${(this.globalProject as Project).name}`);
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.intercept(`api/v2/projects/${(this.globalProject as Project).id}/update/`).as(
      'projectUpdateRequest'
    );
    cy.clickButton(/^Sync project$/);
    cy.wait('@projectUpdateRequest');
  });

  it('can sync project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByText(`${project.name}`);
    cy.intercept(`api/v2/projects/${project.name}/update/`).as('projectUpdateRequest');
    cy.contains('td', `${project.name}`)
      .parent()
      .within(() => {
        cy.get('#sync-project').click();
      });
    cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
  });

  it('can edit a project from the project details tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickButton(/^Edit project$/);
    cy.verifyPageTitle('Edit Project');
    cy.get('[data-cy="project-name"]').clear().type(`${project.name} - edited`);
    cy.get('[data-cy="project-scm-branch"]').clear().type('foobar');
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(`${project.name} - edited`);
    cy.hasDetail(/^Source control branch$/, 'foobar');
  });

  it('can edit a project from the project list row action', () => {
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(project.name);
    cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
      cy.get('[data-cy="edit-project"]').click();
    });
    cy.verifyPageTitle('Edit Project');
    cy.clickButton(/^Cancel$/);
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

  it('can copy project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.get('[data-cy="page-title"]').should('contain', project.name);
    cy.clickPageAction(/^Copy project$/);
    cy.get('[data-cy="page-title"]')
      .should('contain', `${project.name} - edited`)
      .should('be.visible');
  });

  it('can copy project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.searchAndDisplayResource(`${project.name} - edited`);
    cy.clickTableRowKebabAction(`${project.name} - edited`, /^Copy project$/);
    cy.getTableRowByText(`${project.name} - edited @`).should('be.visible');
  });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list table row kebab menu', () => {
  //   cy.requestPost<Project>('/api/v2/projects/', {
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
  //         cy.get('#cancel-project-sync').click();
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
  //   cy.requestPost<Project>('/api/v2/projects/', {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'https://github.com/ansible/ansible-ui',
  //   }).then((testProject) => {
  //     cy.navigateTo('awx', 'projects');
  //     cy.selectTableRow(testProject.name);
  //     cy.clickToolbarKebabAction(/^Cancel selected projects$/);
  //     cy.get('#confirm').click();
  //     cy.clickButton(/^Cancel project sync/);
  //     cy.contains(/^Success$/);
  //     cy.clickButton(/^Close$/);
  //     cy.filterTableByText(testProject.name);
  //     cy.get('td[data-label="Status"]').should('contain', 'Canceled');
  //     cy.clickButton(/^Clear all filters$/);
  //   });
  // });
});

describe('projects', () => {
  let organization: Organization;
  let project: Project;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject({ organization: organization.id }).then((proj) => {
        project = proj;
      });
    });
  });

  it('can delete project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRowKebabAction(`${project.name}`, /^Delete project$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(`${project.name}`).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can delete project from projects list toolbar ', function () {
    cy.navigateTo('awx', 'projects');
    cy.selectTableRow(`${project.name}`);
    cy.clickToolbarKebabAction(/^Delete selected projects$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(`${project.name}`).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can delete project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(`${project.name}`);
    cy.get('[data-cy="page-title"]').should('contain', `${project.name}`);
    cy.clickPageAction(/^Delete project/);
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.intercept('DELETE', `/api/v2/projects/${project.id}/`).as('deleted');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.wait('@deleted');
    });
    cy.getTableRowByText(`${project.name}`).should('not.exist');
    cy.verifyPageTitle('Projects');
  });
});
