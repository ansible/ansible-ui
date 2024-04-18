import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';

describe('activity-stream', () => {
  let team: Team;
  let activeUser: AwxUser;

  before(function () {
    cy.awxLogin();
    cy.createAwxTeam(this.globalOrganization as Organization).then((createdTeam) => {
      team = createdTeam;
    });
    cy.requestGet<AwxItemsResponse<AwxUser>>(awxAPI`/me/`)
      .its('results')
      .then((results) => {
        activeUser = results[0];
      });
  });

  after(function () {
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
  });

  beforeEach(function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
  });

  it('can render the activity stream list page', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
  });

  it('event column displays correct info', function () {
    cy.getTableRowBySingleText(team.name).should('be.visible');
    cy.get('[data-cy="event-column-cell"]').should('have.text', `created team ${team.name}`);
  });

  it.skip('event details modal displays correct info', function () {
    //this test is being skipped due to flakiness. will come back to it during hardening.
    cy.getTableRowBySingleText(team.name)
      .should('be.visible')
      .then(() => {
        cy.get('button[data-cy="view-event-details"]')
          .first() // This assumes the first event is the one we just created, which is not always the case
          .click()
          .then(() => {
            cy.get('dd[data-cy="initiated-by"]').should('have.text', activeUser.username);
            cy.get('dd[data-cy="action"]').should('have.text', `created team ${team.name}`);
            cy.get('dd[data-cy="timestamp"]').should('not.be.empty');
            cy.clickModalButton('Close');
          });
      });
  });

  it('can navigate to event resource detail page from activity stream list page', function () {
    cy.getTableRowBySingleText(team.name).should('be.visible');
    cy.clickLink(team.name);
    cy.verifyPageTitle(team.name);
  });

  it.skip('can navigate to event resource detail page from activity stream event details modal', function () {
    //this test is being skipped due to flakiness. will come back to it during hardening.
    cy.getTableRowBySingleText(team.name)
      .should('be.visible')
      .then(() => {
        cy.get('button[data-cy="view-event-details"]').first().click();
        cy.get('[role="dialog"] a[data-cy="source-resource-detail"]').click();
        cy.verifyPageTitle(team.name);
      });
  });

  it.skip('can navigate to initiator detail page from activity stream list page', function () {
    //this test is being skipped due to flakiness. will come back to it during hardening.
    cy.getTableRowBySingleText(team.name).should('be.visible');
    cy.get('[data-cy="initiated-by-column-cell"] a').first().click();
    cy.verifyPageTitle(activeUser.username);
  });

  it.skip('can navigate to initiator detail page from activity stream event details modal', function () {
    //this test is being skipped due to flakiness. will come back to it during hardening.
    cy.getTableRowBySingleText(team.name).should('be.visible');
    cy.get('button[data-cy="view-event-details"]').first().click();
    cy.get('dd[data-cy="initiated-by"] a').click();
    cy.verifyPageTitle(activeUser.username);
  });

  it('can filter by keyword from activity stream list', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    cy.get('tbody').find('tr').should('have.length', 1);
  });

  it('can filter by initiated by from activity stream list', function () {
    cy.intercept(`api/v2/activity_stream/?actor__username__icontains=${activeUser.username}*`).as(
      'initiatorFilterRequest'
    );
    cy.filterTableByTextFilter('initiated-by-(username)', activeUser.username);
    cy.wait('@initiatorFilterRequest')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(200);
      });
  });
});
