/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../framework/utils/random-string';
import { Organization } from '../../../frontend/controller/interfaces/Organization';
import { Project } from '../../../frontend/controller/interfaces/Project';
import { ItemsResponse } from '../../../frontend/Data';

describe('projects', () => {
  let organization: Organization;

  beforeEach(() => {
    cy.requestGet<ItemsResponse<Organization>>(
      '/api/v2/organizations/?name__contains=Default'
    ).then((response) => (organization = response.results[0]));
  });

  // it('create project', () => {
  //   const projectName = 'Project ' + randomString(4);
  //   cy.navigateTo(/^Projects$/, true);
  //   cy.clickButton(/^Create project$/);
  //   cy.typeByLabel(/^Name$/, projectName);
  //   cy.typeByLabel(/^Organization$/, 'Default');
  //   cy.clickButton(/^Create project$/);
  //   cy.hasTitle(projectName);
  //   cy.requestGet<ItemsResponse<Project>>(`/api/v2/projects/?name__contains=${projectName}`).then(
  //     (response) => {
  //       if (response.results.length > 0) {
  //         cy.requestDelete(`/api/v2/projects/${response.results[0].id}/`);
  //       }
  //     }
  //   );
  // });

  //   it('edit project', () => {
  //     cy.requestPost<Project>('/api/v2/projects/', {
  //       name: 'Project ' + randomString(4),
  //       organization: organization.id,
  //     }).then((project) => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.clickRow(project.name);
  //       cy.clickButton(/^Edit project$/);
  //       cy.hasTitle(/^Edit project$/);
  //       cy.typeByLabel(/^Name$/, 'a');
  //       cy.clickButton(/^Save project$/);
  //       cy.hasTitle(`${project.name}a`);
  //       cy.requestDelete(`/api/v2/projects/${project.id}/`);
  //     });
  //   });

  it('project details', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickButton(/^Details$/);
      cy.contains('#name', project.name);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project access', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickTab(/^Access$/);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project job templates', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickTab(/^Job Templates$/);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project notifications', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickTab(/^Notifications$/);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project schedules', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickTab(/^Schedules$/);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  //   it('project details edit project', () => {
  //     cy.requestPost<Project>('/api/v2/projects/', {
  //       name: 'Project ' + randomString(4),
  //       organization: organization.id,
  //     }).then((project) => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.clickRow(project.name);
  //       cy.hasTitle(project.name);
  //       cy.clickButton(/^Edit project$/);
  //       cy.hasTitle(/^Edit project$/);
  //       cy.typeByLabel(/^Name$/, 'a');
  //       cy.clickButton(/^Save project$/);
  //       cy.hasTitle(`${project.name}a`);
  //       cy.requestDelete(`/api/v2/projects/${project.id}/`);
  //     });
  //   });

  it('project details copy project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickPageAction(/^Copy project$/);
      // ensure toast message shows up
      cy.hasAlert(`${project.name} copied`);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project details sync project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickPageAction(/^Sync project$/);
      // ensure toast message shows up
      cy.hasAlert(`Syncing ${project.name}`);
      cy.requestDelete(`/api/v2/projects/${project.id}/`);
    });
  });

  it('project details delete project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRow(project.name);
      cy.hasTitle(project.name);
      cy.clickPageAction(/^Delete project/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.hasTitle(/^Projects$/);
    });
  });

  //   it('projects table row edit project', () => {
  //     cy.requestPost<Project>('/api/v2/projects/', {
  //       name: 'Project ' + randomString(4),
  //       organization: organization.id,
  //     }).then((project) => {
  //       cy.navigateTo(/^Projects$/, true);
  //       cy.get('#edit-project').click();
  //       cy.hasTitle(/^Edit project$/);
  //       cy.requestDelete(`/api/v2/projects/${project.id}/`);
  //     });
  //   });

  it('projects table row delete project', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
      cy.navigateTo(/^Projects$/, false);
      cy.clickRowAction(project.name, /^Delete project$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('projects toolbar delete projects', () => {
    cy.requestPost<Project>('/api/v2/projects/', {
      name: 'Project ' + randomString(4),
      organization: organization.id,
    }).then((project) => {
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
});
