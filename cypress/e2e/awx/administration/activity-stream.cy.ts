/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('activity-stream', () => {
  let team: Team;
  let activeUser: User;
  beforeEach(function () {
    cy.awxLogin();
    cy.createAwxTeam(this.globalOrganization as Organization).then((createdTeam) => {
      team = createdTeam;
    });
    cy.requestGet<AwxItemsResponse<User>>(awxAPI`/me/`)
      .its('results')
      .then((results) => {
        activeUser = results[0];
      });
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
  });
  afterEach(function () {
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
  });
  it('can render the activity stream list page', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
  });
  it('event column displays correct info', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.get('[data-cy="event-column-cell"]').should('have.text', `created team ${team.name}`);
    cy.clearAllFilters();
  });
  it('event details modal displays correct info', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.get('button[data-cy="view-event-details"]').click();
    cy.get('.pf-v5-c-description-list__text > span').should(
      'have.text',
      `created team ${team.name}`
    );
    cy.clickModalButton('Close');
    cy.clearAllFilters();
  });
  it('can navigate to event resource detail page from activity stream list page', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.clickLink(team.name);
    cy.verifyPageTitle(team.name);
  });
  it('can navigate to event resource detail page from activity stream event details modal', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.get('button[data-cy="view-event-details"]').click();
    cy.get('.pf-v5-c-description-list__text > span > a').click();
    cy.verifyPageTitle(team.name);
  });
  it('can navigate to initiator detail page from activity stream list page', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.get('[data-cy="initiated-by-column-cell"] a').click();
    cy.verifyPageTitle(activeUser.username);
  });
  it('can navigate to initiator detail page from activity stream event details modal', function () {
    cy.getTableRowByText(team.name).should('be.visible');
    cy.get('button[data-cy="view-event-details"]').click();
    cy.get('dd[data-cy="initiated-by"] a').click();
    cy.verifyPageTitle(activeUser.username);
  });
  it('can filter by keyword from activity stream list', function () {
    cy.filterTableByTypeAndText(/^Keyword$/, team.name);
    cy.get('tbody').find('tr').should('have.length', 1);
    cy.clearAllFilters();
  });
  it('can filter by initiated by from activity stream list', function () {
    cy.intercept(`api/v2/activity_stream/?actor__username__icontains=${activeUser.username}*`).as(
      'initiatorFilterRequest'
    );
    cy.filterTableByTypeAndText('Initiated by (username)', activeUser.username);
    cy.wait('@initiatorFilterRequest')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(200);
      });
    cy.clearAllFilters();
  });
});
