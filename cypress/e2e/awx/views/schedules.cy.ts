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

  it('renders schedules list', () => {
    cy.navigateTo(/^Schedules$/);
    cy.hasTitle(/^Schedules$/);
    cy.getTableRowByText(schedule.name);
    cy.deleteAWXSchedule(schedule);
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo(/^Schedules$/);
    cy.get('.pf-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected schedules$/).should('exist');
      cy.deleteAWXSchedule(schedule);
    });
  });

  it('deletes a schedule from the schedules list row', () => {
    cy.navigateTo(/^Schedules$/);
    cy.clickTableRowKebabAction(schedule.name, /^Delete schedule$/, true);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.filterTableByText(schedule.name);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.navigateTo(/^Schedules$/);
    cy.getTableRowByText(schedule.name).within(() => {
      cy.get('input[aria-label="Select all rows"]').click();
    });
    cy.clickToolbarKebabAction(/^Delete selected schedules$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('tr', schedule.name).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });
});
