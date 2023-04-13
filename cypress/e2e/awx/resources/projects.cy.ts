/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { ItemsResponse } from '../../../../frontend/common/crud/Data';

describe('projects', () => {
  let organization: Organization;
  let project: Project;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
    cy.createAwxProject().then((proj) => {
      project = proj;
    });
  });

  after(() => {
    cy.deleteAwxProject(project);
    cy.deleteAwxOrganization(organization).then(() => {
      /**
       * Deleting the organization does not delete the underlying projects.
       * So get all projects without an organization and delete them. Multiple test runs
       * could be running, so only delete projects without an organization as those are not being used.
       * This also cleans up projects that were syncing and could not be deleted by other runs,
       * making a self cleaning E2E system for the live server.
       */
      cy.requestGet<ItemsResponse<Project>>(
        `/api/v2/projects/?page_size=100&organization=null`
      ).then((itemsResponse) => {
        for (const project of itemsResponse.results) {
          cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
        }
      });
    });
  });

  it('can render the projects list page', () => {
    cy.navigateTo(/^Projects$/);
    cy.hasTitle(/^Projects$/);
  });
  // it('create project', () => {
  //   const projectName = 'E2E Project ' + randomString(4);
  //   cy.navigateTo(/^Projects$/, true);
  //   cy.clickButton(/^Create project$/);
  //   cy.typeByLabel(/^Name$/, projectName);
  //   cy.typeByLabel(/^Organization$/, 'Default');
  //   cy.clickButton(/^Create project$/);
  //   cy.hasTitle(projectName);
  // });
  // it('can edit a project from the project details tab', () => {
  //     cy.navigateTo(/^Projects$/);
  //     cy.clickRow(project.name);
  //     cy.hasTitle(project.name);
  //     cy.clickButton(/^Edit project$/);
  //     cy.hasTitle(/^Edit project$/);
  //     cy.typeByLabel(/^Name$/, 'a');
  //     cy.clickButton(/^Save project$/);
  //     cy.hasTitle(`${project.name}a`);
  // });
  it('can navigate to project details tab', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickButton(/^Details$/);
    cy.get('#name').should('contain', project.name);
  });
  it('can navigate to project access tab', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Access$/);
  });
  it('can navigate to project job templates tab', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Job Templates$/);
  });
  it('can navigate to project notifications tab', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Notifications$/);
  });
  it('can navigate to project schedules tab', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Schedules$/);
  });
  it('can copy project from project details page', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be copied
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRow(testProject.name);
      cy.hasTitle(testProject.name);
      cy.clickPageAction(/^Copy project$/);
      cy.hasAlert(`${testProject.name} copied`).should('be.visible');
      cy.requestDelete(`/api/v2/projects/${testProject.id}/`, true);
    });
  });
  it('can delete project from project details page', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRow(testProject.name);
      cy.hasTitle(testProject.name);
      cy.clickPageAction(/^Delete project/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.getRowFromList(testProject.name).should('not.exist');
      cy.hasTitle(/^Projects$/);
    });
  });
  it('can sync project from project details page', () => {
    cy.createAwxProject().then((project) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickButton(/^Sync project$/);
      cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
      cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
    });
  });
  it('can sync project from projects list table row kebab menu', () => {
    cy.createAwxProject().then((project) => {
      cy.navigateTo(/^Projects$/);
      cy.filterByText(project.name);
      cy.contains('td', project.name)
        .parent()
        .within(() => {
          cy.get('#sync-project').click();
        });
      cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
      cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
    });
  });
  it('can cancel project sync from projects list table row kebab menu', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.filterByText(testProject.name);
      cy.contains('td', testProject.name)
        .parent()
        .within(() => {
          cy.get('#cancel-project-sync').click();
        });
      cy.get('#confirm').click();
      cy.clickButton(/^Cancel project sync/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.filterByText(testProject.name);
      cy.get('td[data-label="Status"]').should('contain', 'Canceled');
      cy.clickButton(/^Clear all filters$/);
      cy.requestDelete(`/api/v2/projects/${testProject.id}/`, true);
    });
  });
  it('can copy project from projects list table row kebab menu', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRowAction(testProject.name, /^Copy project$/);
      cy.getRowFromList(`${testProject.name} @`).should('be.visible');
      cy.requestDelete(`/api/v2/projects/${testProject.id}/`, true);
    });
  });
  //   it('can edit project from projects list table row kebab menu', () => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.get('#edit-project').click();
  //       cy.hasTitle(/^Edit project$/);
  //   });
  it('can delete project from projects list table row kebab menu', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRowAction(testProject.name, /^Delete project$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.getRowFromList(testProject.name).should('not.exist');
    });
  });
  it('can delete project from projects list toolbar ', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.selectRow(testProject.name);
      cy.clickToolbarAction(/^Delete selected projects$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.getRowFromList(testProject.name).should('not.exist');
    });
  });
  it('can cancel project sync from projects list toolbar ', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.selectRow(testProject.name);
      cy.clickToolbarAction(/^Cancel selected projects$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Cancel project sync/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.filterByText(testProject.name);
      cy.get('td[data-label="Status"]').should('contain', 'Canceled');
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
