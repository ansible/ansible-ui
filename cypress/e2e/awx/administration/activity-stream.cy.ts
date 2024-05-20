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

  function openEventDetails(teamName: string) {
    cy.getTableRow('event', `created team ${teamName}`, { disableFilter: true }).within(() => {
      cy.getByDataCy('view-event-details').click();
    });
  }

  it('can render the activity stream list page', function () {
    cy.verifyPageTitle('Activity Stream');
  });

  it.skip('event column displays correct info', function () {
    cy.getTableRow('event', `created team ${team.name}`, { disableFilter: true }).within(() => {
      cy.getByDataCy('event-column-cell').should('have.text', `created team ${team.name}`);
    });
  });

  it.skip('event details modal displays correct info', function () {
    openEventDetails(team.name);
    cy.getModal().within(() => {
      cy.getByDataCy('initiated-by').should('have.text', activeUser.username);
      cy.getByDataCy('action').should('have.text', `created team ${team.name}`);
      cy.getByDataCy('time').should('not.be.empty');
    });
    cy.clickModalButton('Close');
  });

  it('can navigate to event resource detail page from activity stream list page', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    cy.getTableRow('event', `created team ${team.name}`, { disableFilter: true }).within(() => {
      cy.getByDataCy('source-resource-detail').click();
    });
    cy.verifyPageTitle(team.name);
  });

  it('can navigate to event resource detail page from activity stream event details modal', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    openEventDetails(team.name);
    cy.getModal().within(() => {
      cy.getByDataCy('source-resource-detail').click();
    });
    cy.verifyPageTitle(team.name);
  });

  it('can navigate to initiator detail page from activity stream list page', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    cy.getTableRow('event', `created team ${team.name}`, { disableFilter: true }).within(() => {
      cy.getBy('[data-cy="initiated-by-column-cell"] a').click();
    });
    cy.verifyPageTitle(activeUser.username);
  });

  it('can navigate to initiator detail page from activity stream event details modal', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    openEventDetails(team.name);
    cy.getModal().within(() => {
      cy.getBy('dd[data-cy="initiated-by"] a').click();
    });
    cy.verifyPageTitle(activeUser.username);
  });

  it('can filter by keyword from activity stream list', function () {
    cy.filterTableByTextFilter('keyword', team.name);
    cy.get('tbody').find('tr').should('have.length', 1);
    cy.getByDataCy('event-column-cell').should('have.text', `created team ${team.name}`);
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
    cy.get('[data-cy="initiated-by-column-cell"]').first().should('have.text', activeUser.username);
  });
});
