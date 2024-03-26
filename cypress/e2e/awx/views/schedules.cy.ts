/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';

describe('schedules', () => {
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('renders schedules list', () => {
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
    cy.getTableRowByText(schedule.name);
    cy.deleteAWXSchedule(schedule);
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo('awx', 'schedules');
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected schedules$/).should('exist');
      cy.deleteAWXSchedule(schedule);
    });
  });

  it('deletes a schedule from the schedules list row', () => {
    cy.navigateTo('awx', 'schedules');
    cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', true);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.filterTableByText(schedule.name);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getTableRowByText(schedule.name).within(() => {
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

  it('loads the correct options for the schedule wizard', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.get('.pf-v5-c-form__label-text').contains(/Resource type/);
  });
});
