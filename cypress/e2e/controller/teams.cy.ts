/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../framework/utils/random-string';
import { Organization } from '../../../frontend/controller/interfaces/Organization';
import { Team } from '../../../frontend/controller/interfaces/Team';
import { ItemsResponse } from '../../../frontend/Data';

describe('teams', () => {
  let organization: Organization;

  beforeEach(() => {
    cy.requestGet<ItemsResponse<Organization>>(
      '/api/v2/organizations/?name__contains=Default'
    ).then((response) => (organization = response.results[0]));
  });

  it('create team', () => {
    const teamName = 'Team ' + randomString(4);
    cy.navigateTo(/^Teams$/, true);
    cy.clickButton(/^Create team$/);
    cy.typeByLabel(/^Name$/, teamName);
    cy.typeByLabel(/^Organization$/, 'Default');
    cy.clickButton(/^Create team$/);
    cy.hasTitle(teamName);
    cy.requestGet<ItemsResponse<Team>>(`/api/v2/teams/?name__contains=${teamName}`).then(
      (response) => {
        if (response.results.length > 0) {
          cy.requestDelete(`/api/v2/teams/${response.results[0].id}/`);
        }
      }
    );
  });

  it('edit team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.clickButton(/^Edit team$/);
      cy.hasTitle(/^Edit team$/);
      cy.typeByLabel(/^Name$/, 'a');
      cy.clickButton(/^Save team$/);
      cy.hasTitle(`${team.name}a`);
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('team details', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickButton(/^Details$/);
      cy.contains('#name', team.name);
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('team access', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickTab(/^Access$/);
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('team roles', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.clickRow(team.name);
      cy.hasTitle(team.name);
      cy.clickTab(/^Roles$/);
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('team details edit team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
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
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('team details delete team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
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
      name: 'Team ' + randomString(4),
      organization: organization.id,
    }).then((team) => {
      cy.navigateTo(/^Teams$/, true);
      cy.get('#edit-team').click();
      cy.hasTitle(/^Edit team$/);
      cy.requestDelete(`/api/v2/teams/${team.id}/`);
    });
  });

  it('teams table row delete team', () => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'Team ' + randomString(4),
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
      name: 'Team ' + randomString(4),
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
