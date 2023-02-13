/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../framework/utils/random-string';
import { Organization } from '../../../frontend/controller/interfaces/Organization';
import { Project } from '../../../frontend/controller/interfaces/Project';
import { ItemsResponse } from '../../../frontend/Data';

describe('projects', () => {
  let organization: Organization;
  let project: Project;

  before(() => {
    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Projects ' + randomString(4),
    }).then((testOrg) => (organization = testOrg));
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
    // Deleting the organization does not delete the projects...
    // So get all projects without an organization and delete them
    // Multiple test runs could be running, so only delete projects without an organization as those are not being used.
    // This does cleanup projects that were sync and could not be deleted by other runs, making a self cleaning E2E system for the live server.
    cy.requestGet<ItemsResponse<Project>>(`/api/v2/projects/?limit=100&organization=null`).then(
      (itemsResponse) => {
        for (const project of itemsResponse.results) {
          cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
        }
      }
    );
  });

  beforeEach(() => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
    }).then((testProject) => (project = testProject));
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/projects/${project.id}/`, true);
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

  //   it('edit project', () => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.clickRow(project.name);
  //       cy.clickButton(/^Edit project$/);
  //       cy.hasTitle(/^Edit project$/);
  //       cy.typeByLabel(/^Name$/, 'a');
  //       cy.clickButton(/^Save project$/);
  //       cy.hasTitle(`${project.name}a`);
  //   });

  it('project details', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', project.name);
  });

  it('project access', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Access$/);
  });

  it('project job templates', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Job Templates$/);
  });

  it('project notifications', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Notifications$/);
  });

  it('project schedules', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickTab(/^Schedules$/);
  });

  //   it('project details edit project', () => {
  //       cy.navigateTo(/^Projects$/, true);
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
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickPageAction(/^Copy project$/);
      cy.hasAlert(`${project.name} copied`);
    });
  });

  it('project details sync project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git', // Only projects with scm_type and scm_url can be synced
      scm_url: 'foo',
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickPageAction(/^Sync project$/);
      cy.hasAlert(`Syncing ${project.name}`);
    });
  });

  it('project details delete project', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(project.name);
    cy.hasTitle(project.name);
    cy.clickPageAction(/^Delete project/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.hasTitle(/^Projects$/);
  });

  //   it('projects table row edit project', () => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.get('#edit-project').click();
  //       cy.hasTitle(/^Edit project$/);
  //   });

  it('projects table row delete project', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRowAction(project.name, /^Delete project$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('projects toolbar delete projects', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.selectRow(project.name);
    cy.clickToolbarAction(/^Delete selected projects$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
