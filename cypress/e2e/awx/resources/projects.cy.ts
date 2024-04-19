/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
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
    cy.singleSelectByDataCy('organization', `${(this.globalOrganization as Organization).name}`);
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
    cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
    cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickLink(/^Details$/);
    cy.get('#name').should('contain', `${(this.globalProject as Project).name}`);
  });

  it('can navigate to project access tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
    cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Access$/, true);
  });

  it('can navigate to project job templates tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
    cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Job templates$/, true);
  });

  it('can navigate to project notifications tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
    cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Notifications$/, true);
  });

  it('can navigate to project schedules tab', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
    cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
    cy.clickTab(/^Schedules$/, true);
  });
});

describe('project edit and delete tests', () => {
  let project: Project;
  let organization: Organization;
  let user: AwxUser;

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
    cy.filterTableByMultiSelect('name', [project.name]);
    cy.clickTableRowLink('name', project.name, {
      disableFilter: true,
    });
    cy.verifyPageTitle(`${project.name}`);
    cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
    cy.clickButton(/^Sync project$/);
    cy.wait('@projectUpdateRequest');
  });

  it('can edit a project from the project details tab', () => {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [project.name]);
    cy.clickTableRowLink('name', project.name, {
      disableFilter: true,
    });
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
    cy.filterTableByMultiSelect('name', [project.name]);
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
    cy.filterTableByMultiSelect('name', [project.name]);
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
    cy.filterTableByMultiSelect('name', [endOfProject]);
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
        cy.filterTableByMultiSelect('name', [endOfProject]);
        cy.clearAllFilters();
      });
  });

  it('can copy project from projects list table row kebab menu', function () {
    const endOfProject = project.name.split(' ').slice(-1).toString();
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [endOfProject]);
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
        cy.filterTableByMultiSelect('name', [endOfProject]);
        cy.clearAllFilters();
      });
  });

  it('can delete project from projects list table row kebab menu', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [project.name]);
    cy.clickTableRowAction('name', `${project.name}`, 'delete-project', {
      inKebab: true,
      disableFilter: true,
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete project/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clearAllFilters();
    cy.contains('tr', project.name).should('not.exist');
    cy.clearAllFilters();
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
    cy.filterTableByMultiSelect('name', [endOfProject]);
    cy.selectTableRowByCheckbox('name', `${project.name}`, { disableFilter: true });
    cy.clickToolbarKebabAction('delete-selected-projects');
    cy.get('#confirm').click();
    cy.get('button[data-ouia-component-id="submit"]').click();
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.contains('tr', project.name).should('not.exist');
    cy.clearAllFilters();
  });

  it('can delete project from project details page', function () {
    cy.navigateTo('awx', 'projects');
    cy.filterTableByMultiSelect('name', [project.name]);
    cy.clickTableRowLink('name', project.name, { disableFilter: true });
    cy.get('[data-cy="page-title"]').should('contain', `${project.name}`);
    cy.clickPageAction('delete-project');
    cy.get('.pf-v5-c-modal-box').within(() => {
      cy.intercept('DELETE', awxAPI`/projects/${project.id.toString()}/`).as('deleted');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete project/);
      cy.wait('@deleted');
    });
    cy.contains('tr', project.name).should('not.exist');
    cy.verifyPageTitle('Projects');
  });
});

describe.skip('project schedule edit and delete', () => {
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    const name = 'E2E' + randomString(4);
    cy.createAWXSchedule({
      name,
      unified_job_template: (this.globalProject as Project).id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;
      cy.navigateTo('awx', 'projects');
      cy.filterTableBySingleSelect('name', (this.globalProject as Project).name);
      cy.get('[data-cy="name-column-cell"]').click();
      cy.clickTab('Schedules', true);
    });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('can edit a simple schedule from details page', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
    cy.getByDataCy('wizard-nav').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.get('[data-cy="description"]').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });
  it('can edit a simple schedule from the schedules list row', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.getByDataCy('description').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add rules', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'Africa/Abidjan');
    cy.getByDataCy('undefined-form-group').within(() => {
      cy.getBy('[aria-label="Time picker"]').click().type('{selectall} 5:00 AM');
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('start-date/time').contains('5:00 AM');
    cy.getByDataCy('rule-2').should('exist');
    cy.getByDataCy('rule-2').contains('FREQ=YEARLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add exceptions', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);

    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Create exception$/);
    cy.get('[data-cy="freq-form-group"]').click();
    cy.get('[data-cy="freq"]').within(() => {
      cy.clickButton('Yearly');
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('exception-1').contains('FREQ=YEARLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to remove rules', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.getBy('[data-cy="row-id-1"]').within(() => {
      cy.getBy('[data-cy="delete-rule"]').click();
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('rule-1').should('not.contain', 'FREQ=DAILY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule remove exceptions', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowLink('name', schedule.name, { disableFilter: true });
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Create exception$/);
    cy.clickButton(/^Add$/);
    cy.getBy('[data-cy="row-id-1"]').within(() => {
      cy.getBy('[data-cy="delete-exception"]').click();
    });
    cy.clickButton(/^Next$/);
    cy.getByDataCy('exception-1').should('not.contain', 'FREQ=DAILY');
  });

  it('can toggle a schedule', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
    });

    cy.get('input[aria-label="Click to enable schedule"]').should('exist');
    cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
    });
    cy.get('input[aria-label="Click to disable schedule"]').should('exist');
  });
  it('deletes a schedule from the schedules list row', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getTableRow('name', schedule.name, { disableFilter: true }).within(() => {
      cy.get('input[aria-label="Select all rows"]').click();
    });
    cy.clickToolbarKebabAction('delete-selected-schedules');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('tr', schedule.name).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });
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
