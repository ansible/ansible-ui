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
        cy.waitForProjectToFinishSyncing(proj.id);
      });
    });
  });

  it('can render the projects list page', () => {
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
  });
  it('create project and then delete project from project details page', () => {
    const projectName = 'E2E Project ' + randomString(4);
    cy.navigateTo('awx', 'projects');
    cy.clickLink(/^Create project$/);
    cy.get('[data-cy="project-name"]').type(projectName);
    cy.selectDropdownOptionByResourceName('organization', organization.name);
    cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
    cy.get('[data-cy="project-scm-url"]').type('https://github.com/ansible/ansible-tower-samples');
    cy.getCheckboxByLabel('Allow Branch Override').click();
    cy.clickButton(/^Create project$/);
    cy.verifyPageTitle(projectName);
    cy.hasDetail(/^Organization$/, organization.name);
    cy.hasDetail(/^Source control type$/, 'Git');
    cy.hasDetail(/^Enabled options$/, 'Allow branch override');
    cy.clickPageAction(/^Delete project/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.verifyPageTitle('Projects');
  });

  it('can edit a project from the project details tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickButton(/^Edit project$/);
    cy.verifyPageTitle('Edit Project');
    cy.get('[data-cy="project-name"]').type(`${project.name} - edited`);
    cy.get('[data-cy="project-scm-branch"]').type('foobar');
    cy.clickButton(/^Save project$/);
    cy.verifyPageTitle(`${project.name} - edited`);
    cy.hasDetail(/^Source control branch$/, 'foobar');
  });

  it('can edit a project from the project list row action', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRowActionIcon(project.name, 'Edit project');
    cy.verifyPageTitle('Edit Project');
    cy.clickButton(/^Cancel$/);
    cy.verifyPageTitle('Projects');
  });

  it('can navigate to project details tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickLink(/^Details$/);
    cy.get('#name').should('contain', project.name);
  });

  it('can navigate to project access tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickTab(/^Access$/, true);
  });

  it('can navigate to project job templates tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickTab(/^Job templates$/, true);
  });

  it('can navigate to project notifications tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickTab(/^Notifications$/, true);
  });

  it('can navigate to project schedules tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.clickTableRow(project.name);
    cy.verifyPageTitle(project.name);
    cy.clickTab(/^Schedules$/, true);
  });

  it('can copy project from project details page', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be copied
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo('awx', 'projects');
      cy.clickTableRow(testProject.name);
      cy.verifyPageTitle(testProject.name);
      cy.clickPageAction(/^Copy project$/);
      cy.hasAlert(`${testProject.name} copied`).should('be.visible');
      cy.waitForProjectToFinishSyncing(testProject.id);
      cy.deleteAwxProject(testProject);
    });
  });

  it('can sync project from project details page', () => {
    cy.createAwxProject().then((project) => {
      cy.navigateTo('awx', 'projects');
      cy.clickTableRow(project.name);
      cy.verifyPageTitle(project.name);
      cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
      cy.clickButton(/^Sync project$/);
      cy.wait('@projectUpdateRequest');
      cy.waitForProjectToFinishSyncing(project.id);
      cy.deleteAwxProject(project);
    });
  });

  it('can sync project from projects list table row kebab menu', () => {
    cy.createAwxProject().then((project) => {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByText(project.name);
      cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
      cy.contains('td', project.name)
        .parent()
        .within(() => {
          cy.get('#sync-project').click();
        });
      cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
      cy.waitForProjectToFinishSyncing(project.id);
      cy.deleteAwxProject(project);
    });
  });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list table row kebab menu', () => {
  //   cy.requestPost<Project>('/api/v2/projects/', {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'foo',
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

  it('can copy project from projects list table row kebab menu', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo('awx', 'projects');
      cy.clickTableRowKebabAction(testProject.name, /^Copy project$/);
      cy.getTableRowByText(`${testProject.name} @`).should('be.visible');
      cy.waitForProjectToFinishSyncing(testProject.id);
      cy.deleteAwxProject(testProject);
    });
  });

  it('can delete project from projects list table row kebab menu', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo('awx', 'projects');
      cy.clickTableRowKebabAction(testProject.name, /^Delete project$/);
      cy.waitForProjectToFinishSyncing(testProject.id);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.getTableRowByText(testProject.name).should('not.exist');
    });
  });

  it('can delete project from projects list toolbar ', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo('awx', 'projects');
      cy.selectTableRow(testProject.name);
      cy.clickToolbarKebabAction(/^Delete selected projects$/);
      cy.waitForProjectToFinishSyncing(testProject.id);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.getTableRowByText(testProject.name).should('not.exist');
    });
  });

  it('can delete project from project details page', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo('awx', 'projects');
      cy.clickTableRow(testProject.name);
      cy.verifyPageTitle(testProject.name);
      cy.clickPageAction(/^Delete project/);
      cy.waitForProjectToFinishSyncing(testProject.id);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.getTableRowByText(testProject.name).should('not.exist');
      cy.verifyPageTitle('Projects');
    });
  });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list toolbar ', () => {
  //   cy.requestPost<Project>('/api/v2/projects/', {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'foo',
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
