import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../../support/formatApiPathForAwx';

describe('activity-stream', () => {
  let inventory: Inventory;
  let awxOrganization: Organization;
  let currentUser: AwxUser;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;

      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;

        cy.getCurrentUser().then((user) => {
          currentUser = user;
        });
      });
    });
  });

  after(function () {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  function openEventDetails(inventoryName: string) {
    cy.filterTableByTextFilter('keyword', `inventory ${inventoryName}`);
    cy.getByDataCy('view-event-details').click();
  }

  it('event column displays correct info', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    cy.filterTableByTextFilter('keyword', `inventory ${inventory.name}`);
    cy.contains(`created inventory ${inventory.name}`);
  });

  it('event details modal displays correct info', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    openEventDetails(inventory.name);
    cy.getModal().within(() => {
      cy.getByDataCy('initiated-by').should('have.text', currentUser.username);
      cy.getByDataCy('action').should('have.text', ` created inventory ${inventory.name}`);
      cy.getByDataCy('time').should('not.be.empty');
    });
    cy.clickModalButton('Close');
  });

  it('can navigate to event resource detail page from activity stream list page', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    cy.filterTableByTextFilter('keyword', inventory.name);
    cy.getTableRow('event', ` created inventory ${inventory.name}`, { disableFilter: true }).within(
      () => {
        cy.getByDataCy('source-resource-detail').click();
      }
    );
    cy.verifyPageTitle(inventory.name);
  });

  it('can navigate to event resource detail page from activity stream event details modal', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    cy.filterTableByTextFilter('keyword', inventory.name);
    openEventDetails(inventory.name);
    cy.getModal().within(() => {
      cy.getByDataCy('source-resource-detail').click();
    });
    cy.verifyPageTitle(inventory.name);
  });

  it('can filter by keyword from activity stream list', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    cy.filterTableByTextFilter('keyword', inventory.name);
    cy.get('tbody').find('tr').should('have.length', 1);
    cy.get(`[data-cy='event-column-cell']`, { timeout: 30000 }).should(
      'have.text',
      ` created inventory ${inventory.name}`
    );
  });

  it('can filter by initiated by from activity stream list', function () {
    cy.navigateTo('awx', 'activity-stream');
    cy.verifyPageTitle('Activity Stream');
    cy.intercept(
      'GET',
      awxAPI`/activity_stream/?actor__username__icontains=${currentUser.username}*`
    ).as('initiatorFilterRequest');
    cy.filterTableByTextFilter('initiated-by-(username)', currentUser.username);
    cy.wait('@initiatorFilterRequest')
      .then((response) => {
        expect(response?.response?.statusCode).to.eql(200);
      })
      .its('response')
      .then((activityStream) => {
        cy.log('ACTIVITY STREAM', activityStream);
      });
    cy.get('[data-cy="initiated-by-column-cell"]')
      .first()
      .should('have.text', currentUser.username);
  });
});
