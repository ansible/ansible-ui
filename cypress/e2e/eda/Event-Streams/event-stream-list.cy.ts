/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { edaAPI } from '../../../support/formatApiPathForEDA';
import { EdaWebhook } from '../../../../frontend/eda/interfaces/EdaWebhook';
import { EdaCredential } from '../../../../frontend/eda/interfaces/EdaCredential';

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.
describe('Event Streams List', () => {
  let EdaWebhook1: EdaWebhook;
  let EdaWebhook2: EdaWebhook;
  let EdaCredential: EdaCredential;

  before(() => {
    cy.createBasicWebhookCredential().then((credential) => {
      EdaCredential = credential;
      cy.createBasicWebhook(credential).then((webhook) => {
        EdaWebhook1 = webhook;
      });
      cy.createBasicWebhook(credential).then((webhook) => {
        EdaWebhook2 = webhook;
      });
    });
  });

  after(() => {
    cy.deleteWebhook(EdaWebhook1);
    cy.deleteWebhook(EdaWebhook2);
    cy.deleteEdaCredential(EdaCredential);
  });

  it('renders the Event Streams page and filter', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.filterTableByText(EdaWebhook1.name);
    cy.get('td[data-cy=name-column-cell]').should('contain', EdaWebhook1.name);
    cy.clickButton(/^Clear all filters$/);
    cy.filterTableByText(EdaWebhook2.name);
    cy.get('td[data-cy=name-column-cell]').should('contain', EdaWebhook2.name);
  });

  it('can switch the event stream to test mode from the list view', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.intercept('PATCH', edaAPI`/webhooks/${EdaWebhook1.id.toString()}/`).as('webhook1');
    cy.filterTableByText(EdaWebhook1.name);
    cy.clickTableRowAction('name', EdaWebhook1.name, 'switch-to-test-mode', {
      disableFilter: true,
      inKebab: true,
    });
    cy.wait('@webhook1').then((webhook1) => {
      expect(webhook1?.response?.statusCode).to.eql(200);
    });
    cy.clickButton(/^Clear all filters$/);
  });

  it('can bulk delete event streams', () => {
    cy.navigateTo('eda', 'webhooks');
    cy.verifyPageTitle('Event Streams');
    cy.selectTableRow(EdaWebhook1.name, true);
    cy.clickButton(/^Clear all filters$/);
    cy.selectTableRow(EdaWebhook2.name, true);
    cy.clickToolbarKebabAction('delete-selected-event-streams');
    cy.intercept('DELETE', edaAPI`/webhooks/${EdaWebhook1.id.toString()}/`).as('webhook1');
    cy.intercept('DELETE', edaAPI`/webhooks/${EdaWebhook2.id.toString()}/`).as('webhook2');
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete event streams');
    cy.wait('@webhook1').then((webhook1) => {
      expect(webhook1?.response?.statusCode).to.eql(204);
    });
    cy.wait('@webhook2').then((webhook2) => {
      expect(webhook2?.response?.statusCode).to.eql(204);
    });
    cy.assertModalSuccess();
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
