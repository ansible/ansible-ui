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
      cy.requestGet<ItemsResponse<Project>>(`/api/v2/projects/?limit=100&organization=null`).then(
        (itemsResponse) => {
          for (const project of itemsResponse.results) {
            cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
          }
        }
      );
    });
  });

  it('projects page', () => {
    cy.navigateTo(/^Projects$/);
    cy.hasTitle(/^Projects$/);
  });

  // it('create project', () => {
  //   const projectName = 'E2E Project ' + randomString(4);
  //   cy.navigateTo(/^Projects$/);
  //   cy.clickButton(/^Create project$/);
  //   cy.typeByLabel(/^Name$/, projectName);
  //   cy.typeByLabel(/^Organization$/, 'Default');
  //   cy.clickButton(/^Create project$/);
  //   cy.hasTitle(projectName);
  // });

  //   it('edit project', () => {
  //       cy.navigateTo(/^Projects$/);
  //       cy.clickRow(project.name);
  //       cy.clickButton(/^Edit project$/);
  //       cy.hasTitle(/^Edit project$/);
  //       cy.typeByLabel(/^Name$/, 'a');
  //       cy.clickButton(/^Save project$/);
  //       cy.hasTitle(`${project.name}a`);
  //   });

  it('project details', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', project.name);
  });

  it('project access', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Access$/);
  });

  it('project job templates', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Job Templates$/);
  });

  it('project notifications', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Notifications$/);
  });

  it('project schedules', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Schedules$/);
  });

  //   it('project details edit project', () => {
  //       cy.navigateTo(/^Projects$/);
  //       cy.clickRow(project.name);
  //       cy.hasTitle(project.name);
  //       cy.clickButton(/^Edit project$/);
  //       cy.hasTitle(/^Edit project$/);
  //       cy.typeByLabel(/^Name$/, 'a');
  //       cy.clickButton(/^Save project$/);
  //       cy.hasTitle(`${project.name}a`);
  //   });

  it('project details copy project', () => {
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
      cy.hasAlert(`${testProject.name} copied`);
      cy.requestDelete(`/api/v2/projects/${testProject.id}/`, true);
    });
  });

  it('project details sync project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((testProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRow(testProject.name);
      cy.hasTitle(testProject.name);
      cy.clickPageAction(/^Sync project$/);
      cy.hasAlert(`Syncing ${testProject.name}`);
      cy.requestDelete(`/api/v2/projects/${testProject.id}/`, true);
    });
  });

  it('project details delete project', () => {
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
      cy.hasTitle(/^Projects$/);
    });
  });

  //   it('projects table row edit project', () => {
  //       cy.navigateTo(/^Projects$/);
  //       cy.get('#edit-project').click();
  //       cy.hasTitle(/^Edit project$/);
  //   });

  it('projects table row delete project', () => {
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
    });
  });

  it('projects toolbar delete projects', () => {
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
    });
  });
});
