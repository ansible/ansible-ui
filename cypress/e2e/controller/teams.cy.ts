/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../framework/utils/random-string';
import { Organization } from '../../../frontend/controller/interfaces/Organization';
import { Team } from '../../../frontend/controller/interfaces/Team';

describe('teams', () => {
  let organization: Organization;

  before(() => {
    cy.login();

    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Teams ' + randomString(4),
    }).then((newOrg) => (organization = newOrg));
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`);
  });

  it('create team', () => {
    const teamName = 'E2E Team ' + randomString(4);
    cy.navigateTo(/^Teams$/, true);
    cy.clickButton(/^Create team$/);
    cy.typeByLabel(/^Name$/, teamName);
    cy.typeByLabel(/^Organization$/, organization.name);
    cy.clickButton(/^Create team$/);
    cy.hasTitle(teamName);
  });

  it('edit team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.clickButton(/^Edit team$/);
      cy.hasTitle(/^Edit team$/);
      cy.typeByLabel(/^Name$/, 'a');
      cy.clickButton(/^Save team$/);
      cy.hasTitle(`${team.name}a`);
    });
  });

  it('team details', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickButton(/^Details$/);
      cy.contains('#name', team.name);
    });
  });

  it('team access', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickTab(/^Access$/);
    });
  });

  it('team roles', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickTab(/^Roles$/);
    });
  });

  it('team details edit team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickButton(/^Edit team$/);
      cy.hasTitle(/^Edit team$/);
      cy.typeByLabel(/^Name$/, 'a');
      cy.clickButton(/^Save team$/);
      cy.hasTitle(`${team.name}a`);
    });
  });

  it('team details delete team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickPageAction(/^Delete team/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.hasTitle(/^Teams$/);
    });
  });

  it('teams table row edit team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then(() => {
      cy.navigateTo(/^Teams$/, true);
      cy.get('#edit-team').click();
      cy.hasTitle(/^Edit team$/);
    });
  });

  it('teams table row delete team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRowAction(team.name, /^Delete team$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('teams toolbar delete teams', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.selectRow(team.name);
      cy.clickToolbarAction(/^Delete selected teams$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
