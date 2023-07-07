/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />
import { HubDashboard } from './constants';

describe('hub dashboard', () => {
  before(() => {
    cy.hubLogin();
  });

  it('render the hub dashboard', () => {
    cy.visit('hub/dashboard');
    cy.get('.pf-c-title').contains(HubDashboard.title);
  });
});
